--
-- PostgreSQL database dump
--

-- Dumped from database version 14.9 (Homebrew)
-- Dumped by pg_dump version 14.9 (Homebrew)

--
-- Name: choice_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.choice_enum AS ENUM (
    'agree',
    'disagree',
    'skip',
    'itsComplicated'
);


--
-- Name: polls_visibility_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.polls_visibility_enum AS ENUM (
    'public',
    'hidden',
    'private'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Author; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Author" (
    id integer NOT NULL,
    "userId" text NOT NULL,
    name text,
    "avatarUrl" text,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Author_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Author_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Author_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Author_id_seq" OWNED BY public."Author".id;


--
-- Name: Comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Comment" (
    id integer NOT NULL,
    "userId" text,
    "sessionId" character varying NOT NULL,
    text text NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "pollId" integer NOT NULL
);


--
-- Name: Comment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Comment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Comment_id_seq" OWNED BY public."Comment".id;


--
-- Name: FlaggedStatement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FlaggedStatement" (
    id integer NOT NULL,
    "statementId" integer NOT NULL,
    user_id text,
    session_id character varying NOT NULL,
    reason text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    description text
);


--
-- Name: Statement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Statement" (
    id integer NOT NULL,
    poll_id integer NOT NULL,
    user_id text,
    session_id character varying,
    text text NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public."Statement".id;


--
-- Name: flagged_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.flagged_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: flagged_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.flagged_comments_id_seq OWNED BY public."FlaggedStatement".id;


--
-- Name: polls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.polls (
    id integer NOT NULL,
    user_id text NOT NULL,
    slug character varying,
    title character varying NOT NULL,
    core_question text NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    visibility public.polls_visibility_enum DEFAULT 'public'::public.polls_visibility_enum NOT NULL,
    analytics_filters jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: polls_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.polls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: polls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.polls_id_seq OWNED BY public.polls.id;


--
-- Name: responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.responses (
    id integer NOT NULL,
    user_id text,
    "statementId" integer NOT NULL,
    session_id character varying NOT NULL,
    choice public.choice_enum NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: responses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.responses_id_seq OWNED BY public.responses.id;


--
-- Name: Author id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Author" ALTER COLUMN id SET DEFAULT nextval('public."Author_id_seq"'::regclass);


--
-- Name: Comment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment" ALTER COLUMN id SET DEFAULT nextval('public."Comment_id_seq"'::regclass);


--
-- Name: FlaggedStatement id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FlaggedStatement" ALTER COLUMN id SET DEFAULT nextval('public.flagged_comments_id_seq'::regclass);


--
-- Name: Statement id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Statement" ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: polls id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls ALTER COLUMN id SET DEFAULT nextval('public.polls_id_seq'::regclass);


--
-- Name: responses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responses ALTER COLUMN id SET DEFAULT nextval('public.responses_id_seq'::regclass);


--
-- Name: Author Author_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Author"
    ADD CONSTRAINT "Author_pkey" PRIMARY KEY (id);


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- Name: FlaggedStatement FlaggedStatement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FlaggedStatement"
    ADD CONSTRAINT "FlaggedStatement_pkey" PRIMARY KEY (id);


--
-- Name: Statement Statement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Statement"
    ADD CONSTRAINT "Statement_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: polls polls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls
    ADD CONSTRAINT polls_pkey PRIMARY KEY (id);


--
-- Name: responses responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT responses_pkey PRIMARY KEY (id);


--
-- Name: Author_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Author_id_key" ON public."Author" USING btree (id);


--
-- Name: Author_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Author_userId_key" ON public."Author" USING btree ("userId");


--
-- Name: Comment_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Comment_id_key" ON public."Comment" USING btree (id);


--
-- Name: FlaggedStatement_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "FlaggedStatement_id_key" ON public."FlaggedStatement" USING btree (id);


--
-- Name: Statement_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Statement_id_key" ON public."Statement" USING btree (id);


--
-- Name: polls_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX polls_id_key ON public.polls USING btree (id);


--
-- Name: polls_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX polls_slug_key ON public.polls USING btree (slug);


--
-- Name: responses_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX responses_id_key ON public.responses USING btree (id);


--
-- Name: Comment Comment_pollId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES public.polls(id) ON DELETE CASCADE;


--
-- Name: Comment Comment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Author"("userId");


--
-- Name: FlaggedStatement FlaggedStatement_statementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FlaggedStatement"
    ADD CONSTRAINT "FlaggedStatement_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES public."Statement"(id) ON DELETE CASCADE;


--
-- Name: Statement Statement_poll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Statement"
    ADD CONSTRAINT "Statement_poll_id_fkey" FOREIGN KEY (poll_id) REFERENCES public.polls(id) ON DELETE CASCADE;


--
-- Name: Statement Statement_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Statement"
    ADD CONSTRAINT "Statement_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Author"("userId");


--
-- Name: responses responses_statementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT "responses_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES public."Statement"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

