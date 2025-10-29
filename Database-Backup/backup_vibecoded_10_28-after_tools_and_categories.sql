--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_tags; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.app_tags (
    app_id character varying NOT NULL,
    tag_id character varying NOT NULL
);


ALTER TABLE public.app_tags OWNER TO neondb_owner;

--
-- Name: app_tools; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.app_tools (
    app_id character varying NOT NULL,
    tool_id character varying NOT NULL
);


ALTER TABLE public.app_tools OWNER TO neondb_owner;

--
-- Name: apps; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.apps (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    short_description character varying(200) NOT NULL,
    full_description text NOT NULL,
    launch_url character varying(255) NOT NULL,
    preview_image_url character varying(255) NOT NULL,
    key_learnings text,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    average_rating numeric(4,2) DEFAULT 0.00 NOT NULL,
    rating_count integer DEFAULT 0 NOT NULL,
    creator_id character varying,
    category_id character varying,
    created_date timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    rejection_reason text,
    rejected_at timestamp without time zone,
    rejected_by character varying,
    CONSTRAINT apps_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'pending_approval'::character varying, 'published'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.apps OWNER TO neondb_owner;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.comments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    content text NOT NULL,
    app_id character varying NOT NULL,
    user_id character varying,
    parent_comment_id character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    deleted_by character varying
);


ALTER TABLE public.comments OWNER TO neondb_owner;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reviews (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    app_id character varying NOT NULL,
    user_id character varying NOT NULL,
    rating integer NOT NULL,
    title character varying(150),
    body text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    deleted_by character varying
);


ALTER TABLE public.reviews OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tags (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.tags OWNER TO neondb_owner;

--
-- Name: tool_suggestions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tool_suggestions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    suggested_name character varying(100) NOT NULL,
    app_id character varying NOT NULL,
    user_id character varying,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tool_suggestions OWNER TO neondb_owner;

--
-- Name: tools; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tools (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    website_url character varying(255),
    logo_url character varying(255)
);


ALTER TABLE public.tools OWNER TO neondb_owner;

--
-- Name: user_authentications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_authentications (
    provider character varying(50) NOT NULL,
    provider_id character varying(255) NOT NULL,
    user_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_authentications OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    profile_picture_url character varying(255),
    bio text,
    social_link_1 character varying(255),
    social_link_2 character varying(255),
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: app_tags; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.app_tags (app_id, tag_id) FROM stdin;
eafa9f0a-567e-4c7c-b55c-7ec756a1f6d9	036c7f68-efd0-42d7-8e07-a9bd45d31d4f
eafa9f0a-567e-4c7c-b55c-7ec756a1f6d9	91fdacb0-169b-48c2-840d-4699d658c091
eafa9f0a-567e-4c7c-b55c-7ec756a1f6d9	51596aff-15a0-44a7-9e55-eedb5ac2957e
eafa9f0a-567e-4c7c-b55c-7ec756a1f6d9	1135eab6-902c-485b-bf4f-b68d38f285a2
13c86c11-adf5-48fd-8795-afbf498d9f1b	70361c85-f664-4f66-9aef-ec584e7e04aa
13c86c11-adf5-48fd-8795-afbf498d9f1b	e82ce0c5-2888-4cc5-9a0e-eb720d0cb171
7f49ea58-945c-4f80-9891-eaa263442c4a	036c7f68-efd0-42d7-8e07-a9bd45d31d4f
7f49ea58-945c-4f80-9891-eaa263442c4a	9cc31dca-61c1-4308-ae72-d0a52c209950
7f49ea58-945c-4f80-9891-eaa263442c4a	7cbbeea6-4cb9-4199-96c0-afdf805ce69c
40fedabf-b569-4bd7-964d-4ac933dcdd14	589e55ee-25ea-47ab-845c-fa343ff0aa13
b9a06f99-0cae-4d2c-9ef9-84cf92b5b84f	589e55ee-25ea-47ab-845c-fa343ff0aa13
e1da82cc-f41d-48a2-bc81-d64714c6f7fa	45ef9905-c14e-4931-96df-022ac5a4dcf7
e1da82cc-f41d-48a2-bc81-d64714c6f7fa	de1f614b-eb6c-482d-8739-87c6c38dec47
e1da82cc-f41d-48a2-bc81-d64714c6f7fa	82fb252a-53ff-4361-9a36-a3a2e0011df4
96bcb855-788d-4aab-8d8b-4a996dc0f75f	a14f1dfb-406a-4a39-b1d6-334fed8dec4e
96bcb855-788d-4aab-8d8b-4a996dc0f75f	88794218-fd98-459e-842f-fb5ec722991e
96bcb855-788d-4aab-8d8b-4a996dc0f75f	9cc31dca-61c1-4308-ae72-d0a52c209950
666b9ff3-8b1b-4b3c-a8fb-f7d540b5dd48	75297870-b874-47b3-b16f-3e8c7330b825
666b9ff3-8b1b-4b3c-a8fb-f7d540b5dd48	91fdacb0-169b-48c2-840d-4699d658c091
c9ba6bbc-fac7-465d-a739-bab715fcfb0f	10d0738f-fc91-4596-b04a-2c50e9145d36
c9ba6bbc-fac7-465d-a739-bab715fcfb0f	452abbb0-95c2-45eb-9917-53c8479368f7
c9ba6bbc-fac7-465d-a739-bab715fcfb0f	51596aff-15a0-44a7-9e55-eedb5ac2957e
5d794b7f-619b-4668-a3d2-da62de5b5010	81c13a4b-67d0-48cc-9e0f-301fe428a0e0
5d794b7f-619b-4668-a3d2-da62de5b5010	3a6aa722-f70e-4d7e-8f0d-da0420ea0ec4
\.


--
-- Data for Name: app_tools; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.app_tools (app_id, tool_id) FROM stdin;
eafa9f0a-567e-4c7c-b55c-7ec756a1f6d9	a2fe232e-193a-4f68-9fbc-2bd9965e720a
13c86c11-adf5-48fd-8795-afbf498d9f1b	2362edc4-a71c-4224-a051-cf1a0ed01ecb
7f49ea58-945c-4f80-9891-eaa263442c4a	16cb616c-97ca-4c1e-b1f2-c398ae25c643
5af2e0d4-febc-4881-bcd0-6c09d2f8f252	a2fe232e-193a-4f68-9fbc-2bd9965e720a
40fedabf-b569-4bd7-964d-4ac933dcdd14	16cb616c-97ca-4c1e-b1f2-c398ae25c643
b9a06f99-0cae-4d2c-9ef9-84cf92b5b84f	c1b1f7be-2221-4c90-8b2e-d6e7ab988d26
e1da82cc-f41d-48a2-bc81-d64714c6f7fa	2362edc4-a71c-4224-a051-cf1a0ed01ecb
96bcb855-788d-4aab-8d8b-4a996dc0f75f	2362edc4-a71c-4224-a051-cf1a0ed01ecb
666b9ff3-8b1b-4b3c-a8fb-f7d540b5dd48	2362edc4-a71c-4224-a051-cf1a0ed01ecb
c9ba6bbc-fac7-465d-a739-bab715fcfb0f	a2fe232e-193a-4f68-9fbc-2bd9965e720a
5d794b7f-619b-4668-a3d2-da62de5b5010	a2fe232e-193a-4f68-9fbc-2bd9965e720a
\.


--
-- Data for Name: apps; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.apps (id, name, short_description, full_description, launch_url, preview_image_url, key_learnings, status, view_count, average_rating, rating_count, creator_id, category_id, created_date, updated_at, rejection_reason, rejected_at, rejected_by) FROM stdin;
5af2e0d4-febc-4881-bcd0-6c09d2f8f252	Elite Commerce	This is an E commerce platform for premium goods. 	This app is targeted for someone\n* as you know, you have to target it for someone\n\nYou can do things with this application\\\nA wise man once said,\\\n**Being able to do things with is the purpose of an application**\n\nwhat to come next\n- [x] do the first thing\n- [ ] the second thing\n- [ ] completing it if you can, or just leave it hanging\n	https://elite-commerce.replit.app	/objects/uploads/1f74d05a-c492-4740-a798-0a979875d9f7	I learned the following things. I think it would be valuable for you guys as well.\n* ai is good for doing stuff\n* ai is pretty much stupid when it comes to ui\n* you are stupid\n\n\n	published	7	3.00	3	108933455161619019355	563cda8d-37ce-47ac-9a1d-e4e63a0492c4	2025-10-15 13:58:57.102371	2025-10-24 08:13:48.878	\N	\N	\N
b9a06f99-0cae-4d2c-9ef9-84cf92b5b84f	Travel Agency	This is the short description which briefly describes the application. This is shown in the app card.	\n\n**Your premier online destination for luxury and premium goods.**\n\nElite Commerce offers a curated selection of high-end products, exclusive collections, and world-class brands. We cater to discerning shoppers who value quality, craftsmanship, and a sophisticated online experience.\n\n### Why Shop With Us?\n\n* **Curated Excellence:** Only the finest, authentic premium goods.\n* **Exclusive Access:** Find items and brands not available elsewhere.\n* **Seamless Luxury:** A simple, elegant, and secure shopping platform.	https://www.google.com	/objects/uploads/b7d2ceb6-19e8-4711-8201-26e6b88907b6		published	0	0.00	0	108933455161619019355	92cc5610-2cf3-42eb-868c-e8ebc732aa83	2025-10-28 02:02:21.459141	2025-10-28 09:53:40.134	\N	\N	\N
7f49ea58-945c-4f80-9891-eaa263442c4a	LearnPath	Personalized learning journeys for students who like to learn at their own phase	AI-driven educational platform that creates custom learning paths based on your goals and learning style. Features interactive quizzes, progress tracking, and AI tutoring. Built collaboratively with v0 and ChatGPT.	https://learnpath.example.com	/objects/uploads/a6ff92c5-b299-4a6f-b0e5-785c9f634e93	v0 excelled at creating the UI components, while ChatGPT helped design the adaptive learning algorithm. The combination was surprisingly effective!	published	2	3.00	1	108933455161619019355	9e800106-ff2f-4c3e-8f27-5c325f0e4397	2025-10-15 11:32:00.007059	2025-10-28 09:49:45.783	\N	\N	\N
13c86c11-adf5-48fd-8795-afbf498d9f1b	Apex Fitness	A fitness guide website for fitness enthusiasts of every level	# Apex Fitness\n\n**Your ultimate online hub for achieving peak physical performance.**\n\nApex Fitness provides elite workout programs, expert nutritional guidance, and a robust tracking platform. We empower you to crush your goals, build sustainable habits, and unlock your full potential.\n\n### Why Train With Us?\n\n* **Expert-Led Programs:** Access workouts designed by certified trainers for all fitness levels.\n* **Holistic Tracking:** Monitor your progress, nutrition, and personal records all in one place.\n* **Motivating Community:** Connect with fellow members, share your journey, and stay accountable.	https://codesnap.example.com	/objects/uploads/3426e6e5-24bd-43b7-80a9-83ef0098cc5e	Discovered the power of combining Bolt.new for rapid prototyping with Claude for fine-tuning the UI. Syntax highlighting was easier than expected!	published	3	0.00	0	108933455161619019355	0f902b3f-d80a-49a0-8453-7423776ef308	2025-10-15 11:31:54.752957	2025-10-24 09:46:46.555	\N	\N	\N
96bcb855-788d-4aab-8d8b-4a996dc0f75f	Nora AI	Transform your learning through AI-powered video conversations: from real-time transcription to personalized study plans.	## Nora AI\nNora makes learning easy and personal through video calls that feels like chatting with a friend.\n\n### Our Key Features\n\n\n#### Interactive Video Learning\nChat face-to-face with your AI tutor through natural video calls that feel like talking with a friend\n\n\n#### Smart Note-Taking\nEvery conversation is automatically transcribed and turned into clear notes you can review anytime\n\n\n#### Flexible Scheduling\nCreate your own study plans and get email reminders with direct session links so you never miss a lesson	https://noratutor.xyz/	/objects/uploads/5c740726-678b-4502-8138-1d7083846c17		pending_approval	0	0.00	0	108933455161619019355	9e800106-ff2f-4c3e-8f27-5c325f0e4397	2025-10-28 13:18:47.22107	2025-10-28 13:18:47.22107	\N	\N	\N
eafa9f0a-567e-4c7c-b55c-7ec756a1f6d9	TaskFlow AI	AI-powered task management for busy professionals	TaskFlow AI revolutionizes how you organize your work. Using advanced AI to prioritize tasks, suggest deadlines, and optimize your daily schedule. Built entirely with Replit Agent in just 3 hours!	https://taskflow-ai.example.com	/objects/uploads/95991ff9-59bb-4322-964a-6e4ea2a27b5d	Learned how to implement AI-powered task prioritization, integrate calendar APIs, and build a responsive dashboard with real-time updates.	published	1	0.00	0	108933455161619019355	0f902b3f-d80a-49a0-8453-7423776ef308	2025-10-15 11:31:49.883451	2025-10-24 09:01:58.068	\N	\N	\N
40fedabf-b569-4bd7-964d-4ac933dcdd14	Good Flora	Test app short test description. Lengthening to look better in the cards.	\n\n**Your premier online destination for luxury and premium goods.**\n\nElite Commerce offers a curated selection of high-end products, exclusive collections, and world-class brands. We cater to discerning shoppers who value quality, craftsmanship, and a sophisticated online experience.\n\n### Why Shop With Us?\n\n* **Curated Excellence:** Only the finest, authentic premium goods.\n* **Exclusive Access:** Find items and brands not available elsewhere.\n* **Seamless Luxury:** A simple, elegant, and secure shopping platform.	https://www.google.com	/objects/uploads/11697cba-01ce-4cd4-bd3e-358d1dc21509		published	0	0.00	0	108933455161619019355	13c9d680-4d8b-4370-be83-209c95d30a17	2025-10-21 23:32:16.99078	2025-10-28 09:54:40.113	\N	\N	\N
e1da82cc-f41d-48a2-bc81-d64714c6f7fa	NaviStride	An easy way to make money while driving in your normal li	## NaviStride\nSelf-Driving Models Weren't Trained for Unexpected situations.\nSimulated data breaks down in unpredictable conditions.\n\nFlooded intersections. Halloween mobs. A goat on the highway.\n\nYou've seen it. Your dash could train it.\n\n#### Simulation Isn't Reality\nLLMs Work Because They Trained on the Internet. **AVs Fail Because They Train in a Sandbox.**\n\n### The Solution: Real Data from Real Drivers\nLarge language models succeed because they ingest massive, unfiltered human input—billions of sentences, contexts, contradictions. Self-driving cars need the same approach: real-world data from millions of real drivers in real conditions.\n\n#### Real People Drive Differently\nSimulations and test fleets can't replicate how real people use cars. They don't take spontaneous detours, run late to work, or drive cross-country on impulse. But you do.\n\nBy capturing real drivers in real conditions, we gain access to behavior, routes, and decisions that artificial training sets miss—everything from rural dead zones to crowded school drop-offs.\n\nThis is how machines learn what the road actually is: through your habits, your commutes, your unexpected turns.\n\nSpontaneous detours and unexpected routes\nRunning late and making quick decisions\nReal human behavior in unpredictable conditions\n\n### How it Works\n#### Mount + Launch\nOpen the app, mount your phone on the dashboard, and grant the required permissions. Your phone acts as a temporary sensor hub until the dedicated hardware* is built.\n\n#### Just Drive\nDrive normally—commutes, errands, road trips. The app captures anonymized 360° video (if available), GPS, and other metadata during your trips.\n\n#### Get Paid\nUpon connecting to the internet, the app automatically uploads the captured data to our encrypted servers. Your earnings are calculated based on the value of the data contributed and are transferred to your linked account.\n\n	https://navistride.online/	/objects/uploads/dd527901-44e5-4bc7-91b5-175d3cce99c7		published	0	0.00	0	108933455161619019355	563cda8d-37ce-47ac-9a1d-e4e63a0492c4	2025-10-28 13:05:36.893042	2025-10-28 13:06:55.248	\N	\N	\N
666b9ff3-8b1b-4b3c-a8fb-f7d540b5dd48	Unrav	Transform any web content into your perfect view. Convert articles, papers, PDFs, and YouTube videos into summaries, mindmaps, podcasts, and more.	## SIMPLIFY ANY WEBSITE\n\n### HOW TO USE\n1. Visit any website with content you want to transform\n\n2. Click the UNRAV.IO bookmarklet in your browser\n\n3. Choose how you want to transform the content\n\n4. Enjoy your personalized content experience\n\n[![YouTube Video Thumbnail](https://img.youtube.com/vi/c5QdRBykxFU/hqdefault.jpg)](https://youtu.be/c5QdRBykxFU)\nWatch the demo to see how unrav.io transforms complex content into simple, actionable insights	https://unrav.io/	/objects/uploads/3a0f553a-7b4b-43c6-b0d9-27367afe15bf		pending_approval	0	0.00	0	108933455161619019355	0f902b3f-d80a-49a0-8453-7423776ef308	2025-10-28 13:26:39.444552	2025-10-28 13:31:10.33	\N	\N	\N
c9ba6bbc-fac7-465d-a739-bab715fcfb0f	Journey Mapper	Convert natural language descriptions into professional customer journey maps with AI-powered insights	## Journey Mapper\n### Everything you need to create amazing customer journeys\nOur platform combines AI intelligence with intuitive design to help you visualize and optimize every step of your customer experience.\n\n#### Describe Your Journey\nWrite a simple description of your customer journey in plain English. Include key touchpoints, actions, and experiences you want to map.\n\n#### AI Creates Your Map\nOur AI analyzes your description and automatically generates a professional journey map with stages, touchpoints, emotions, and pain points.\n\n#### Customize & Share\nFine-tune your map with our interactive editor, then export as PDF, copy as markdown, or share with secure links.	https://journey.productfuture.com/	/objects/uploads/b0238567-d7d2-466c-b79a-69cedd856600		pending_approval	0	0.00	0	108933455161619019355	0f902b3f-d80a-49a0-8453-7423776ef308	2025-10-28 13:47:54.560054	2025-10-28 13:47:54.560054	\N	\N	\N
5d794b7f-619b-4668-a3d2-da62de5b5010	Invites	From AI-powered invitation designs to RSVP tracking and event analytics. Everything you need to create memorable events, all in one place.	## Invites\n\n### How It Works\nFrom idea to stunning invitation in under 60 seconds with our AI-powered creation process\n\n#### Step 1: Describe Your Event\nTell our AI about your event type, theme, colors, and style preferences. Choose from dashboard mode or chat interface.\n\n"Birthday party, garden theme, pink & gold, elegant style"\n\n#### Step 2: AI Creates Magic\nWatch as our advanced AI generates up to 10 unique invitation variations instantly. Each design is personalized and ready to use.\n\nStandard (100 credits) • HD (200 credits) • Ultra HD (300 credits)\n\n#### Step 3: Download & Share\nDownload high-resolution images, create shareable links, or generate QR codes. Share privately or add to public gallery.\n\nPNG, JPEG • Public links • QR codes • Bulk download\n\n\n	https://invites.page/	/objects/uploads/33f9ead3-f86a-4ab5-8165-a74fa17ca68b		pending_approval	0	0.00	0	108933455161619019355	0f902b3f-d80a-49a0-8453-7423776ef308	2025-10-28 13:54:15.719338	2025-10-28 13:54:15.719338	\N	\N	\N
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.categories (id, name) FROM stdin;
0f902b3f-d80a-49a0-8453-7423776ef308	Productivity
9e800106-ff2f-4c3e-8f27-5c325f0e4397	Education
235d4890-a7cb-413d-b534-2ab3c9757f5d	Entertainment
563cda8d-37ce-47ac-9a1d-e4e63a0492c4	Business
13c9d680-4d8b-4370-be83-209c95d30a17	Developer Tools
92cc5610-2cf3-42eb-868c-e8ebc732aa83	Design
48bf9d36-b199-46fa-ba35-cd6b264923e2	Other
c486a93b-f4b2-4185-adb1-0462513d63ea	LifeStyle
bc28ad43-75b4-46a9-832a-a1bad405f44b	Fitness
9b55a41a-ad5d-4a71-8d06-40f9522a84dd	Finance
ac3a35db-a810-47b8-ad73-b70a95fc5d89	Dating
5e519f13-6a17-4274-845a-f1d4cff359c9	News
52ce37eb-1ae7-4efb-9c46-e4c8ee4afdbe	Food and Beverage
8a332f50-8086-4083-b175-97198d359564	Social Networking
ed611762-9086-4b78-9d26-abe45ff900d2	Medical
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.comments (id, content, app_id, user_id, parent_comment_id, created_at, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reviews (id, app_id, user_id, rating, title, body, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
1755dfa8-9495-4b3e-951f-9d1b98e95c7c	5af2e0d4-febc-4881-bcd0-6c09d2f8f252	100432844269804452032	2	\N	\N	2025-10-16 11:28:27.826655	2025-10-17 09:07:48.246	\N	\N
1636f87c-1617-48ca-8473-06f0c77a1d55	7f49ea58-945c-4f80-9891-eaa263442c4a	108933455161619019355	3	\N	\N	2025-10-17 09:22:13.887735	2025-10-17 09:29:18.001	\N	\N
5fdc02ed-9be5-4177-856d-acbc1fd42c3d	5af2e0d4-febc-4881-bcd0-6c09d2f8f252	111891123447436316312	5	\N	Very beautiful and functional app	2025-10-16 04:49:52.178052	2025-10-16 04:49:52.178052	\N	\N
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
ZwwpJvUH2ytvP2OkgKFVI9iUZ4_NvtwE	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-19T07:48:56.453Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}}	2025-11-19 07:48:57
k5hARQzrFiaPGc84UzStUc8ZWlz1_vvg	{"cookie": {"path": "/", "secure": true, "expires": "2025-11-19T06:14:04.170Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-19 06:14:05
xGTeH_WHOWLY5p0iMapuN-D1RBlNnBY7	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-14T14:23:57.424Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-19 10:12:18
xYA_V-USyd1HNuSAfN9d1NgG7B5Tuc5N	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-19T05:36:15.257Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}}	2025-11-19 05:36:16
1bv8iSxFubOypBicpyJgyamr74H8i0e4	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-14T12:57:11.760Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-14 14:16:33
jY_rNaRJzsxQUNLqvNkYjaYw4sB2PqmL	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-14T14:23:55.645Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-14 14:23:56
q9Hke61hzvIdrV4fJ8FbLnxhJwZ-cgJg	{"cookie": {"path": "/", "secure": true, "expires": "2025-11-19T06:03:06.635Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-19 06:03:07
f3RNrgQcOPlyR5kThFDlR3O0WOHGA-XM	{"cookie": {"path": "/", "secure": true, "expires": "2025-11-19T06:03:07.762Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-19 06:03:08
x3LTcKWPWTT8sOFqnZxR4MCYuwhuJlXf	{"cookie": {"path": "/", "secure": true, "expires": "2025-11-19T06:03:18.467Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-19 06:03:19
lM5OgF_DowbsRrF6LTI8VZxQa89DHCgD	{"cookie": {"path": "/", "secure": true, "expires": "2025-11-19T06:04:22.034Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-19 06:04:23
ugNUbb41Z3Wnn7rArcnd2gALRkv4l5a9	{"cookie": {"path": "/", "secure": true, "expires": "2025-11-19T06:11:28.211Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-19 06:11:29
hdqMiURKZwmSOaB1aJUCSQ4plIDIKkyr	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-16T09:06:25.942Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "101505659539195399483"}}	2025-11-16 09:06:51
c2rfW7b0nA5jpgNI54XjY40E7OFXEj21	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-15T11:26:05.672Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-19 10:11:04
nnkjLbJBX4GI-3kh-bwUprUYGr7yf-hr	{"cookie": {"path": "/", "secure": true, "expires": "2025-11-19T05:17:24.072Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-19 05:17:25
E4kqMMD8dNkF3rNJcHPIRM7LSOB8QZpR	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-19T05:36:14.883Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}}	2025-11-19 05:36:15
_D_3MJbQ61h2lDnH6bP9Ivbv1_K2I6Sw	{"cookie": {"path": "/", "secure": true, "expires": "2025-11-19T06:03:11.281Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-19 06:03:12
ugXThWuxGcIEoOuZx0o-sLW85cGUUOHU	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-19T05:36:17.871Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}}	2025-11-19 05:36:18
JUz0YHe7vtexCtcUu6rzPjUI8K7TI2bl	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-15T04:49:18.021Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "111891123447436316312"}}	2025-11-15 07:11:30
dV_WdXkSmPsJr6la-n3CVS_ESYbFszAF	{"cookie": {"path": "/", "secure": true, "expires": "2025-11-19T06:14:04.171Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-19 06:14:05
m_b9dLiEO-5VEw6OUQSd9qDxC76gqeLS	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-15T11:28:04.265Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "100432844269804452032"}}	2025-11-16 04:35:55
Aj9pym42tx8CjqbPKkk6qHKFJ2gcEr73	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-19T05:36:14.321Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}}	2025-11-19 05:36:15
BzfDm7_zhNXaqNfjJvg2FJUdKdmGlaDd	{"cookie": {"path": "/", "secure": true, "expires": "2025-11-19T06:03:30.743Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-19 06:03:31
Gh1UTx2YK_qE_N-unDQutYenpsx_PafP	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-15T05:38:41.574Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "100432844269804452032"}}	2025-11-15 09:52:19
LPigJEaZMsAiKIY7_wARxMKVN1X9bYk7	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-15T05:38:26.889Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "101505659539195399483"}}	2025-11-15 09:52:19
lI8MMJH9cyGKASap81LpIzIPEmYSfTtr	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-20T04:55:47.878Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}}	2025-11-20 04:55:48
vp4BGbMXeJSFQQkjjYBwhAcis7FTgCkJ	{"cookie": {"path": "/", "secure": true, "expires": "2025-11-19T07:36:30.484Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-20 11:14:27
v204DGoqnzh2duOqX9DWogdKyITOVVj7	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-20T04:56:33.351Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-27 11:57:42
SJPMesSHPMNCiP2rdGyknf5trIL_HMte	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-19T07:32:47.157Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "108933455161619019355"}}	2025-11-27 13:54:18
mKIS5YTkNatgnZincGhUCshvTZrjdNuF	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-21T03:32:27.375Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "103331786263602169255"}}	2025-11-21 04:04:06
PS6wAxDDvV_MC85p_E5TtjUlbHTUXOMU	{"cookie": {"path": "/", "secure": false, "expires": "2025-11-20T07:48:35.048Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 2592000000}, "passport": {"user": "100432844269804452032"}}	2025-11-27 13:06:57
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tags (id, name) FROM stdin;
036c7f68-efd0-42d7-8e07-a9bd45d31d4f	ai
91fdacb0-169b-48c2-840d-4699d658c091	productivity
51596aff-15a0-44a7-9e55-eedb5ac2957e	automation
70361c85-f664-4f66-9aef-ec584e7e04aa	developer-tools
9cc31dca-61c1-4308-ae72-d0a52c209950	education
e82ce0c5-2888-4cc5-9a0e-eb720d0cb171	code
7cbbeea6-4cb9-4199-96c0-afdf805ce69c	learning
1135eab6-902c-485b-bf4f-b68d38f285a2	task-management
589e55ee-25ea-47ab-845c-fa343ff0aa13	tag
45ef9905-c14e-4931-96df-022ac5a4dcf7	data-collection
de1f614b-eb6c-482d-8739-87c6c38dec47	autonomous-driving
82fb252a-53ff-4361-9a36-a3a2e0011df4	self-driving
a14f1dfb-406a-4a39-b1d6-334fed8dec4e	speaking
88794218-fd98-459e-842f-fb5ec722991e	ai-learning
75297870-b874-47b3-b16f-3e8c7330b825	summarizing
10d0738f-fc91-4596-b04a-2c50e9145d36	journey
452abbb0-95c2-45eb-9917-53c8479368f7	ai-tool
81c13a4b-67d0-48cc-9e0f-301fe428a0e0	events
3a6aa722-f70e-4d7e-8f0d-da0420ea0ec4	event management
\.


--
-- Data for Name: tool_suggestions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tool_suggestions (id, suggested_name, app_id, user_id, status, created_at) FROM stdin;
\.


--
-- Data for Name: tools; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tools (id, name, website_url, logo_url) FROM stdin;
2362edc4-a71c-4224-a051-cf1a0ed01ecb	Bolt.new	https://bolt.new	\N
6406dfb7-4297-4769-a1c0-a2abd0b8d580	v0	https://v0.dev	\N
8ed65f2e-5bf7-42c7-8b26-de01176b896c	Cursor	https://cursor.sh	\N
e91605ac-5fee-4de0-8fe6-48d0e3c5e984	Claude	https://claude.ai	\N
2d683518-e0d6-4799-b9ce-84c726c83413	Lovable	https://lovable.dev	\N
c1b1f7be-2221-4c90-8b2e-d6e7ab988d26	Windsurf	https://codeium.com/windsurf	\N
a2fe232e-193a-4f68-9fbc-2bd9965e720a	Replit	https://replit.com	\N
16cb616c-97ca-4c1e-b1f2-c398ae25c643	ChatGPT	https://chat.openai.com	https://upload.wikimedia.org/wikipedia/commons/1/13/ChatGPT-Logo.png
339aa25c-dbc8-4f7c-9186-823ca3e479da	Rork	https://rork.com/	\N
75f0b67d-850b-4c08-91d4-ddf59824f608	Base44	https://app.base44.com/	\N
d2d3165b-771a-4d74-85ba-bcb072937cdf	Mocha	https://getmocha.com/	\N
9e765081-d45b-419e-a92a-1ab8e8802182	Create Anything	https://www.createanything.com/	\N
55e8e97a-f199-42c4-b5a9-0af0a96a4c59	Vibe Code	https://www.vibecodeapp.com/	\N
a0f68233-71e0-4430-9ea8-38753e4c41d5	Gemini	https://gemini.google.com/	\N
ae822c06-84eb-44fb-ba67-4aa621b7b714	Aider	https://aider.chat/	\N
1ba7cf91-1b68-4064-bb6f-1ce50695501e	GitHub Copilot	https://github.com/features/copilot	\N
17886418-0957-49c8-92f4-80e25dc2ad45	Void Editor	https://voideditor.com/	\N
4e66b513-0b6a-49ce-a47f-686e9929b0c9	Youware	https://www.youware.com/	\N
\.


--
-- Data for Name: user_authentications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_authentications (provider, provider_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, name, email, profile_picture_url, bio, social_link_1, social_link_2, role, created_at, updated_at) FROM stdin;
725de6ca-9676-4e8b-bf03-558c104cc4a0	Alex Chen	alex.chen@example.com	https://api.dicebear.com/7.x/avataaars/svg?seed=alex	Full-stack developer and AI enthusiast. Building the future with vibecoding!	\N	\N	user	2025-10-15 11:31:22.951866	2025-10-15 11:31:22.951866
111891123447436316312	Chamath Udugampola	chamath@sansalabs.co	https://lh3.googleusercontent.com/a/ACg8ocID8-4LNeLFmNpNbBYR008KtzAqYA8JmOO4XmooCZGvdoCDhA=s96-c	\N	\N	\N	user	2025-10-16 04:49:17.823347	2025-10-16 04:49:17.823347
108933455161619019355	Thilina Ilesinghe	thilina@sansatech.com	https://lh3.googleusercontent.com/a/ACg8ocKC8lhoUsoN0-bYuWhOgEVJWRIEpen_6rXNprI-iuRElnVYEQ=s96-c	\N	\N	\N	user	2025-10-15 12:50:26.05452	2025-10-21 04:56:31.737
100432844269804452032	Thilina Avishka	thilinaavishka.kdu@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocIG_DaLI6LZF9qhhE9hT2Q7sBjcysPRn6KmlSyyqRjVOPnsYg=s96-c	\N	\N	\N	admin	2025-10-16 05:38:41.397297	2025-10-21 07:48:33.994
103331786263602169255	Anuke Ganegoda	anuke.ganegoda@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocKLf5CVA-Sbn8-4Ne9FPqwb5d0W7sn27PqhfLh5FivEqoudag=s96-c	\N	\N	\N	admin	2025-10-22 03:32:27.263784	2025-10-22 03:32:27.263784
\.


--
-- Name: app_tags app_tags_app_id_tag_id_pk; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.app_tags
    ADD CONSTRAINT app_tags_app_id_tag_id_pk PRIMARY KEY (app_id, tag_id);


--
-- Name: app_tools app_tools_app_id_tool_id_pk; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.app_tools
    ADD CONSTRAINT app_tools_app_id_tool_id_pk PRIMARY KEY (app_id, tool_id);


--
-- Name: apps apps_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.apps
    ADD CONSTRAINT apps_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_unique UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: tags tags_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_unique UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tool_suggestions tool_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tool_suggestions
    ADD CONSTRAINT tool_suggestions_pkey PRIMARY KEY (id);


--
-- Name: tools tools_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tools
    ADD CONSTRAINT tools_name_unique UNIQUE (name);


--
-- Name: tools tools_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tools
    ADD CONSTRAINT tools_pkey PRIMARY KEY (id);


--
-- Name: reviews unique_user_review; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT unique_user_review UNIQUE (app_id, user_id);


--
-- Name: user_authentications user_authentications_provider_provider_id_pk; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_authentications
    ADD CONSTRAINT user_authentications_provider_provider_id_pk PRIMARY KEY (provider, provider_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: idx_apps_rejected_by; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_apps_rejected_by ON public.apps USING btree (rejected_by);


--
-- Name: idx_apps_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_apps_status ON public.apps USING btree (status);


--
-- Name: idx_comments_deleted_at; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_comments_deleted_at ON public.comments USING btree (deleted_at);


--
-- Name: idx_reviews_deleted_at; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_reviews_deleted_at ON public.reviews USING btree (deleted_at);


--
-- Name: app_tags app_tags_app_id_apps_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.app_tags
    ADD CONSTRAINT app_tags_app_id_apps_id_fk FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE;


--
-- Name: app_tags app_tags_tag_id_tags_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.app_tags
    ADD CONSTRAINT app_tags_tag_id_tags_id_fk FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: app_tools app_tools_app_id_apps_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.app_tools
    ADD CONSTRAINT app_tools_app_id_apps_id_fk FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE;


--
-- Name: app_tools app_tools_tool_id_tools_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.app_tools
    ADD CONSTRAINT app_tools_tool_id_tools_id_fk FOREIGN KEY (tool_id) REFERENCES public.tools(id) ON DELETE CASCADE;


--
-- Name: apps apps_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.apps
    ADD CONSTRAINT apps_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: apps apps_creator_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.apps
    ADD CONSTRAINT apps_creator_id_users_id_fk FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: apps apps_rejected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.apps
    ADD CONSTRAINT apps_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: comments comments_app_id_apps_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_app_id_apps_id_fk FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE;


--
-- Name: comments comments_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: comments comments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_app_id_apps_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_app_id_apps_id_fk FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tool_suggestions tool_suggestions_app_id_apps_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tool_suggestions
    ADD CONSTRAINT tool_suggestions_app_id_apps_id_fk FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE;


--
-- Name: tool_suggestions tool_suggestions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tool_suggestions
    ADD CONSTRAINT tool_suggestions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_authentications user_authentications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_authentications
    ADD CONSTRAINT user_authentications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

