--- Install pgai extension
-- select set_config('ai.ollama_host', 'http://ollama:11434', false) is not null as set_config;

CREATE EXTENSION IF NOT EXISTS ai CASCADE;
CREATE EXTENSION IF NOT EXISTS vectorscale CASCADE;

-------------------------------------------------------------------------------
--- Schema: Tables
-------------------------------------------------------------------------------

DROP TABLE IF EXISTS research_articles;
CREATE TABLE research_articles (
    id              VARCHAR(36)     PRIMARY KEY,
    title           TEXT            NOT NULL,
    release_year    INT             NOT NULL,
    authors         TEXT            NOT NULL,
    publisher       TEXT            NOT NULL,
    citation        TEXT            NOT NULL,
    paper_url       TEXT            NOT NULL,
    paper_pdf_url   TEXT            NOT NULL,
    contents        TEXT            NOT NULL,
    created_at      TIMESTAMP       NOT NULL,

    -- AI generated
    highlights      TEXT            NULL,
    metadata        JSONB           NULL
);

DROP TABLE IF EXISTS chat_sessions;
CREATE TABLE chat_sessions (
    id              VARCHAR(36)     PRIMARY KEY,
    paper_id        VARCHAR(36)     NOT NULL REFERENCES research_articles (id) ON DELETE CASCADE,
    icon            VARCHAR(10)         NOT NULL,
    title           TEXT            NOT NULL,
    created_at      TIMESTAMP       NOT NULL,
    modified_at     TIMESTAMP       NOT NULL
);

DROP TABLE IF EXISTS chat_history;
CREATE TABLE chat_history (
    id              VARCHAR(36)     PRIMARY KEY,
    session_id      VARCHAR(36)     NOT NULL REFERENCES chat_sessions (id) ON DELETE CASCADE,
    chat_role       VARCHAR(10)     NOT NULL,
    contents        TEXT            NOT NULL,
    metadata        JSONB           NULL,
    created_at      TIMESTAMP       NOT NULL
);


-------------------------------------------------------------------------------
--- Schema: Tables
-------------------------------------------------------------------------------

CREATE OR REPLACE VIEW chat_sessions_summary AS 
    SELECT 
        cs.id,
        cs.title,
        ra.id AS paper_id,
        ra.title AS paper_title,
        (SELECT COUNT(*) AS total_chats FROM chat_history ch WHERE ch.session_id = cs.id) as total_chats,
        (SELECT SUM(NULLIF(ch.metadata->>'total_tokens', '')::int) FROM chat_history ch WHERE ch.session_id = cs.id) as total_tokens,
        cs.created_at,
        cs.modified_at
    FROM
        chat_sessions cs
    INNER JOIN
        research_articles ra ON ra.id = cs.paper_id;


-------------------------------------------------------------------------------
--- Schema: Indexes
-------------------------------------------------------------------------------

CREATE INDEX chat_sessions_paper_id_idx ON chat_sessions (paper_id);
CREATE INDEX chat_history_session_id_idx ON chat_history (session_id);


-------------------------------------------------------------------------------
--- Schema: Functions
-------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS extract_paper_highlights;
CREATE OR REPLACE FUNCTION extract_paper_highlights() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_highlight_output        JSONB;
    v_embedding_output        VECTOR(768);
BEGIN
    -- extract highlights
    SELECT ai.openai_chat_complete(
        'gpt-3.5-turbo',
        jsonb_build_array(
            jsonb_build_object('role', 'system', 'content', 'You are a helpful research assistant tasked to summarize the provided text into short bullet points'),
            jsonb_build_object('role', 'user', 'content', SUBSTRING(NEW.contents, 1, 5000))
        )
    ) INTO v_highlight_output;

    -- trace AI usage
    RAISE NOTICE '%', v_embedding_output;

    -- set highlights
    NEW.highlights = v_highlight_output->'choices'->0->'message'->>'content';
    NEW.metadata = v_highlight_output->'usage';

    RETURN NEW;
END;
$$;


-- adapted from: https://python.langchain.com/docs/tutorials/qa_chat_history/
DROP FUNCTION IF EXISTS contextualize_question;
CREATE OR REPLACE FUNCTION contextualize_question(p_session_id VARCHAR(36), p_query TEXT) RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    v_chats				JSONB;
    v_ai_output         JSONB;
	v_paper_title		TEXT;
BEGIN
    -- build chat history
	DROP TABLE IF EXISTS chat_history_session;
    CREATE TEMP TABLE chat_history_session (
        chat_role   TEXT,
        contents    TEXT
    );

	-- get paper title
	SELECT
        research_articles.title
    FROM 
        research_articles
    INNER JOIN
        chat_sessions ON chat_sessions.paper_id = research_articles.id
    WHERE
        chat_sessions.id = p_session_id
    LIMIT 1 
    INTO v_paper_title;

    ---- system prompt
    INSERT INTO chat_history_session VALUES
        ('system', 'Given a chat history and the latest user question which might reference context in the chat history, ' ||
                   'formulate a standalone question which can be understood without the chat history. Do NOT answer the question, ' ||
                   'just reformulate it if needed and otherwise return it as is.' || E'\n\nPaper title:\n' || v_paper_title);
	
    ---- get chat history
    INSERT INTO chat_history_session
        SELECT
            chat_history.chat_role, chat_history.contents
        FROM
            chat_history
        WHERE
            chat_history.session_id = p_session_id
        ORDER BY
            chat_history.created_at DESC
        LIMIT 10;

    ---- current user prompt
    INSERT INTO chat_history_session VALUES
        ('user', p_query);

	SELECT jsonb_agg(jsonb_build_object('role', "chat_role", 'content', "contents")) INTO v_chats FROM chat_history_session;

    RAISE NOTICE '%', v_chats;

    -- generate AI response
    SELECT ai.openai_chat_complete(
        'gpt-3.5-turbo',
        v_chats
    ) INTO v_ai_output;

    -- trace AI usage
    RAISE NOTICE '%', v_ai_output;

    RETURN v_ai_output->'choices'->0->'message'->>'content';
END
$$;


DROP PROCEDURE IF EXISTS chat_with_paper;
CREATE OR REPLACE PROCEDURE chat_with_paper(p_session_id VARCHAR(36), p_chat_content TEXT) LANGUAGE plpgsql AS $$
DECLARE
    v_paper_id          VARCHAR(36);
    v_question          TEXT;
    v_context           TEXT;
	v_chats				JSONB;
    v_ai_output         JSONB;
    v_requested_at      TIMESTAMP := NOW();
BEGIN
    -- contextualize question
	SELECT contextualize_question(p_session_id, p_chat_content) INTO v_question;

    -- get original paper content
    SELECT STRING_AGG(chunk, E'\n\n') FROM (
        SELECT 
            chunk, 
            embedding <=> ai.openai_embed('text-embedding-3-small', v_question, dimensions => 768) AS distance
        FROM
            research_articles_embeddings
        INNER JOIN
            chat_sessions ON chat_sessions.paper_id = research_articles_embeddings.id
        WHERE
            chat_sessions.id = p_session_id
        ORDER BY
            distance
        LIMIT 5
    ) INTO v_context;

    -- generate AI response
    SELECT ai.openai_chat_complete(
        'gpt-3.5-turbo',
        jsonb_build_array(
            jsonb_build_object('role', 'system', 'content', 'You are an assistant for question-answering tasks. ' ||
                                                            'Use the following pieces of retrieved context to answer ' ||
                                                            'the question. If you don''t know the answer, say that you ' ||
                                                            'don''t know. Use three sentences maximum and keep the ' ||
                                                            'answer concise.' ||
                                                            E'\n\n' ||
                                                            v_context),
            jsonb_build_object('role', 'user', 'content', v_question)
        )
    ) INTO v_ai_output;

	RAISE NOTICE '%', v_ai_output;

    -- insert to chat history
    INSERT INTO chat_history(id, session_id, chat_role, contents, metadata, created_at) VALUES
        (gen_random_uuid(), p_session_id, 'user', p_chat_content, NULL, v_requested_at),
        (gen_random_uuid(), p_session_id, 'assistant', v_ai_output->'choices'->0->'message'->>'content', v_ai_output->'usage', NOW());
END;
$$;


DROP FUNCTION IF EXISTS find_highlights;
CREATE OR REPLACE FUNCTION find_highlights(p_query TEXT) RETURNS TABLE (
    paper_id        VARCHAR(36),
    paper_title     TEXT,
    highlights      TEXT,
    distance        FLOAT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sel.id, 
        sel.title, 
        sel.highlights,
        MIN(sel.distance) AS distance
    FROM (
	    SELECT
		    rae.id ,
		    rae.title,
		    rae.highlights,
		    rae.embedding <=> ai.openai_embed('text-embedding-3-small', p_query, dimensions => 768) AS distance
        FROM
		    research_articles_embeddings rae
	    ORDER BY
		    distance
    ) AS sel
    GROUP BY
	    sel.id, 
	    sel.title, 
	    sel.highlights
    ORDER BY
        distance
    LIMIT 10;
END;
$$;


-------------------------------------------------------------------------------
--- Schema: Triggers
-------------------------------------------------------------------------------

CREATE OR REPLACE TRIGGER add_paper_trigger
    BEFORE INSERT OR UPDATE ON research_articles 
    FOR EACH ROW EXECUTE FUNCTION extract_paper_highlights();

SELECT ai.create_vectorizer( 
   'research_articles'::regclass,
    destination => 'research_articles_embeddings',
    embedding => ai.embedding_openai('text-embedding-3-small', 768),
    chunking => ai.chunking_recursive_character_text_splitter('contents', chunk_size => 1024)
);
