--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Ubuntu 16.4-0ubuntu0.24.04.2)
-- Dumped by pg_dump version 16.4 (Ubuntu 16.4-0ubuntu0.24.04.2)

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: shippywhippy_admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO shippywhippy_admin;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: shippywhippy_admin
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Carrier; Type: TABLE; Schema: public; Owner: shippywhippy_admin
--

CREATE TABLE public."Carrier" (
    id integer NOT NULL,
    name text NOT NULL,
    "defaultApiKey" text NOT NULL
);


ALTER TABLE public."Carrier" OWNER TO shippywhippy_admin;

--
-- Name: CarrierConfig; Type: TABLE; Schema: public; Owner: shippywhippy_admin
--

CREATE TABLE public."CarrierConfig" (
    id integer NOT NULL,
    "shopId" integer NOT NULL,
    "carrierId" integer NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "apiKey" text,
    "memberNumber" text
);


ALTER TABLE public."CarrierConfig" OWNER TO shippywhippy_admin;

--
-- Name: CarrierConfig_id_seq; Type: SEQUENCE; Schema: public; Owner: shippywhippy_admin
--

CREATE SEQUENCE public."CarrierConfig_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CarrierConfig_id_seq" OWNER TO shippywhippy_admin;

--
-- Name: CarrierConfig_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shippywhippy_admin
--

ALTER SEQUENCE public."CarrierConfig_id_seq" OWNED BY public."CarrierConfig".id;


--
-- Name: CarrierService; Type: TABLE; Schema: public; Owner: shippywhippy_admin
--

CREATE TABLE public."CarrierService" (
    id text NOT NULL,
    "shopifyId" text NOT NULL,
    name text NOT NULL,
    "callbackUrl" text NOT NULL,
    "serviceDiscovery" boolean NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CarrierService" OWNER TO shippywhippy_admin;

--
-- Name: Carrier_id_seq; Type: SEQUENCE; Schema: public; Owner: shippywhippy_admin
--

CREATE SEQUENCE public."Carrier_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Carrier_id_seq" OWNER TO shippywhippy_admin;

--
-- Name: Carrier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shippywhippy_admin
--

ALTER SEQUENCE public."Carrier_id_seq" OWNED BY public."Carrier".id;


--
-- Name: Location; Type: TABLE; Schema: public; Owner: shippywhippy_admin
--

CREATE TABLE public."Location" (
    id integer NOT NULL,
    "shopId" integer NOT NULL,
    name text NOT NULL,
    address1 text NOT NULL,
    address2 text,
    city text NOT NULL,
    province text NOT NULL,
    country text NOT NULL,
    zip text NOT NULL,
    phone text,
    "shopifyLocationId" text NOT NULL
);


ALTER TABLE public."Location" OWNER TO shippywhippy_admin;

--
-- Name: Location_id_seq; Type: SEQUENCE; Schema: public; Owner: shippywhippy_admin
--

CREATE SEQUENCE public."Location_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Location_id_seq" OWNER TO shippywhippy_admin;

--
-- Name: Location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shippywhippy_admin
--

ALTER SEQUENCE public."Location_id_seq" OWNED BY public."Location".id;


--
-- Name: Session; Type: TABLE; Schema: public; Owner: shippywhippy_admin
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    shop text NOT NULL,
    state text NOT NULL,
    "isOnline" boolean NOT NULL,
    scope text NOT NULL,
    expires timestamp(3) without time zone,
    "accessToken" text NOT NULL,
    "accountOwner" boolean DEFAULT false NOT NULL,
    collaborator boolean DEFAULT false NOT NULL,
    email text,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "firstName" text,
    "lastName" text,
    locale text,
    "shopId" integer,
    "userId" text
);


ALTER TABLE public."Session" OWNER TO shippywhippy_admin;

--
-- Name: ShippingMethod; Type: TABLE; Schema: public; Owner: shippywhippy_admin
--

CREATE TABLE public."ShippingMethod" (
    id integer NOT NULL,
    "carrierId" integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."ShippingMethod" OWNER TO shippywhippy_admin;

--
-- Name: ShippingMethodConfig; Type: TABLE; Schema: public; Owner: shippywhippy_admin
--

CREATE TABLE public."ShippingMethodConfig" (
    id integer NOT NULL,
    "carrierConfigId" integer NOT NULL,
    "shippingMethodId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "customName" text,
    "additionalFlatRate" numeric(65,30),
    "additionalPercentage" numeric(65,30)
);


ALTER TABLE public."ShippingMethodConfig" OWNER TO shippywhippy_admin;

--
-- Name: ShippingMethodConfig_id_seq; Type: SEQUENCE; Schema: public; Owner: shippywhippy_admin
--

CREATE SEQUENCE public."ShippingMethodConfig_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ShippingMethodConfig_id_seq" OWNER TO shippywhippy_admin;

--
-- Name: ShippingMethodConfig_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shippywhippy_admin
--

ALTER SEQUENCE public."ShippingMethodConfig_id_seq" OWNED BY public."ShippingMethodConfig".id;


--
-- Name: ShippingMethod_id_seq; Type: SEQUENCE; Schema: public; Owner: shippywhippy_admin
--

CREATE SEQUENCE public."ShippingMethod_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ShippingMethod_id_seq" OWNER TO shippywhippy_admin;

--
-- Name: ShippingMethod_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shippywhippy_admin
--

ALTER SEQUENCE public."ShippingMethod_id_seq" OWNED BY public."ShippingMethod".id;


--
-- Name: Shop; Type: TABLE; Schema: public; Owner: shippywhippy_admin
--

CREATE TABLE public."Shop" (
    id integer NOT NULL,
    username text NOT NULL,
    "shopifyName" text NOT NULL,
    "shopifyUrl" text NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "daysActive" integer DEFAULT 0 NOT NULL,
    "installedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "uninstalledAt" timestamp(3) without time zone
);


ALTER TABLE public."Shop" OWNER TO shippywhippy_admin;

--
-- Name: Shop_id_seq; Type: SEQUENCE; Schema: public; Owner: shippywhippy_admin
--

CREATE SEQUENCE public."Shop_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Shop_id_seq" OWNER TO shippywhippy_admin;

--
-- Name: Shop_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shippywhippy_admin
--

ALTER SEQUENCE public."Shop_id_seq" OWNED BY public."Shop".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: shippywhippy_admin
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


ALTER TABLE public._prisma_migrations OWNER TO shippywhippy_admin;

--
-- Name: Carrier id; Type: DEFAULT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."Carrier" ALTER COLUMN id SET DEFAULT nextval('public."Carrier_id_seq"'::regclass);


--
-- Name: CarrierConfig id; Type: DEFAULT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."CarrierConfig" ALTER COLUMN id SET DEFAULT nextval('public."CarrierConfig_id_seq"'::regclass);


--
-- Name: Location id; Type: DEFAULT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."Location" ALTER COLUMN id SET DEFAULT nextval('public."Location_id_seq"'::regclass);


--
-- Name: ShippingMethod id; Type: DEFAULT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."ShippingMethod" ALTER COLUMN id SET DEFAULT nextval('public."ShippingMethod_id_seq"'::regclass);


--
-- Name: ShippingMethodConfig id; Type: DEFAULT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."ShippingMethodConfig" ALTER COLUMN id SET DEFAULT nextval('public."ShippingMethodConfig_id_seq"'::regclass);


--
-- Name: Shop id; Type: DEFAULT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."Shop" ALTER COLUMN id SET DEFAULT nextval('public."Shop_id_seq"'::regclass);


--
-- Data for Name: Carrier; Type: TABLE DATA; Schema: public; Owner: shippywhippy_admin
--

COPY public."Carrier" (id, name, "defaultApiKey") FROM stdin;
1	Australia Post	your-default-australia-post-api-key
2	Aramex	your-default-aramex-api-key
\.


--
-- Data for Name: CarrierConfig; Type: TABLE DATA; Schema: public; Owner: shippywhippy_admin
--

COPY public."CarrierConfig" (id, "shopId", "carrierId", "isActive", "apiKey", "memberNumber") FROM stdin;
5	1	1	t	2f34aa06-779c-4cb7-90ae-9311750a2607	\N
28	1	2	t	fdf	\N
\.


--
-- Data for Name: CarrierService; Type: TABLE DATA; Schema: public; Owner: shippywhippy_admin
--

COPY public."CarrierService" (id, "shopifyId", name, "callbackUrl", "serviceDiscovery", active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Location; Type: TABLE DATA; Schema: public; Owner: shippywhippy_admin
--

COPY public."Location" (id, "shopId", name, address1, address2, city, province, country, zip, phone, "shopifyLocationId") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: shippywhippy_admin
--

COPY public."Session" (id, shop, state, "isOnline", scope, expires, "accessToken", "accountOwner", collaborator, email, "emailVerified", "firstName", "lastName", locale, "shopId", "userId") FROM stdin;
offline_froggya.myshopify.com	froggya.myshopify.com	152562128929108	f	write_products,write_shipping	\N	shpua_0f19b1fc993f55c6db96be8f084350d3	f	f	\N	f	\N	\N	\N	\N	\N
\.


--
-- Data for Name: ShippingMethod; Type: TABLE DATA; Schema: public; Owner: shippywhippy_admin
--

COPY public."ShippingMethod" (id, "carrierId", name) FROM stdin;
\.


--
-- Data for Name: ShippingMethodConfig; Type: TABLE DATA; Schema: public; Owner: shippywhippy_admin
--

COPY public."ShippingMethodConfig" (id, "carrierConfigId", "shippingMethodId", "isActive", "customName", "additionalFlatRate", "additionalPercentage") FROM stdin;
\.


--
-- Data for Name: Shop; Type: TABLE DATA; Schema: public; Owner: shippywhippy_admin
--

COPY public."Shop" (id, username, "shopifyName", "shopifyUrl", "isActive", "daysActive", "installedAt", "uninstalledAt") FROM stdin;
1	froggya.myshopify.com	froggya.myshopify.com	https://froggya.myshopify.com	t	0	2024-10-18 02:00:19.824	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: shippywhippy_admin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
544f3b10-9ef0-42bf-b9be-6d3237f55207	409f2143c3e897d90fac5f032234b5c6fe3f65874206eaa3a18e0a7c0318f8fd	2024-10-17 12:58:59.952871+11	20241007070634_init	\N	\N	2024-10-17 12:58:59.806562+11	1
a7402be2-1545-4029-871f-f2b7e7605e03	4230489444e20f03a3ae051be25a4640465010e0fac1f7cdf7dd2852d3aa5fb1	2024-10-17 12:58:59.970933+11	20241007070937_update_session_model	\N	\N	2024-10-17 12:58:59.95686+11	1
247437f2-5d24-4644-aa44-7f0214f46fd8	f76f89e0ef5ac7c8886301c373abf569adbbfb9966053093674a09cf2609ba8b	2024-10-17 12:58:59.987071+11	20241007071405_add_userid_to_session	\N	\N	2024-10-17 12:58:59.974992+11	1
2da8b383-9e09-4ab8-87b9-6f8e1201fed7	43db9ba8676eac10dd87d2bd3747e4206b402b0cb3adeb387b1bce65a2024129	2024-10-17 12:59:00.024868+11	20241017015844_add_default_api_key_to_carrier	\N	\N	2024-10-17 12:58:59.99157+11	1
\.


--
-- Name: CarrierConfig_id_seq; Type: SEQUENCE SET; Schema: public; Owner: shippywhippy_admin
--

SELECT pg_catalog.setval('public."CarrierConfig_id_seq"', 60, true);


--
-- Name: Carrier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: shippywhippy_admin
--

SELECT pg_catalog.setval('public."Carrier_id_seq"', 2, true);


--
-- Name: Location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: shippywhippy_admin
--

SELECT pg_catalog.setval('public."Location_id_seq"', 1, false);


--
-- Name: ShippingMethodConfig_id_seq; Type: SEQUENCE SET; Schema: public; Owner: shippywhippy_admin
--

SELECT pg_catalog.setval('public."ShippingMethodConfig_id_seq"', 1, false);


--
-- Name: ShippingMethod_id_seq; Type: SEQUENCE SET; Schema: public; Owner: shippywhippy_admin
--

SELECT pg_catalog.setval('public."ShippingMethod_id_seq"', 1, false);


--
-- Name: Shop_id_seq; Type: SEQUENCE SET; Schema: public; Owner: shippywhippy_admin
--

SELECT pg_catalog.setval('public."Shop_id_seq"', 1, true);


--
-- Name: CarrierConfig CarrierConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."CarrierConfig"
    ADD CONSTRAINT "CarrierConfig_pkey" PRIMARY KEY (id);


--
-- Name: CarrierService CarrierService_pkey; Type: CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."CarrierService"
    ADD CONSTRAINT "CarrierService_pkey" PRIMARY KEY (id);


--
-- Name: Carrier Carrier_pkey; Type: CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."Carrier"
    ADD CONSTRAINT "Carrier_pkey" PRIMARY KEY (id);


--
-- Name: Location Location_pkey; Type: CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."Location"
    ADD CONSTRAINT "Location_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: ShippingMethodConfig ShippingMethodConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."ShippingMethodConfig"
    ADD CONSTRAINT "ShippingMethodConfig_pkey" PRIMARY KEY (id);


--
-- Name: ShippingMethod ShippingMethod_pkey; Type: CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."ShippingMethod"
    ADD CONSTRAINT "ShippingMethod_pkey" PRIMARY KEY (id);


--
-- Name: Shop Shop_pkey; Type: CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."Shop"
    ADD CONSTRAINT "Shop_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: CarrierConfig_shopId_carrierId_key; Type: INDEX; Schema: public; Owner: shippywhippy_admin
--

CREATE UNIQUE INDEX "CarrierConfig_shopId_carrierId_key" ON public."CarrierConfig" USING btree ("shopId", "carrierId");


--
-- Name: CarrierService_shopifyId_key; Type: INDEX; Schema: public; Owner: shippywhippy_admin
--

CREATE UNIQUE INDEX "CarrierService_shopifyId_key" ON public."CarrierService" USING btree ("shopifyId");


--
-- Name: Carrier_name_key; Type: INDEX; Schema: public; Owner: shippywhippy_admin
--

CREATE UNIQUE INDEX "Carrier_name_key" ON public."Carrier" USING btree (name);


--
-- Name: Location_shopifyLocationId_key; Type: INDEX; Schema: public; Owner: shippywhippy_admin
--

CREATE UNIQUE INDEX "Location_shopifyLocationId_key" ON public."Location" USING btree ("shopifyLocationId");


--
-- Name: ShippingMethodConfig_carrierConfigId_shippingMethodId_key; Type: INDEX; Schema: public; Owner: shippywhippy_admin
--

CREATE UNIQUE INDEX "ShippingMethodConfig_carrierConfigId_shippingMethodId_key" ON public."ShippingMethodConfig" USING btree ("carrierConfigId", "shippingMethodId");


--
-- Name: Shop_username_key; Type: INDEX; Schema: public; Owner: shippywhippy_admin
--

CREATE UNIQUE INDEX "Shop_username_key" ON public."Shop" USING btree (username);


--
-- Name: CarrierConfig CarrierConfig_carrierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."CarrierConfig"
    ADD CONSTRAINT "CarrierConfig_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES public."Carrier"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CarrierConfig CarrierConfig_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."CarrierConfig"
    ADD CONSTRAINT "CarrierConfig_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Location Location_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."Location"
    ADD CONSTRAINT "Location_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public."Shop"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ShippingMethodConfig ShippingMethodConfig_carrierConfigId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."ShippingMethodConfig"
    ADD CONSTRAINT "ShippingMethodConfig_carrierConfigId_fkey" FOREIGN KEY ("carrierConfigId") REFERENCES public."CarrierConfig"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ShippingMethodConfig ShippingMethodConfig_shippingMethodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."ShippingMethodConfig"
    ADD CONSTRAINT "ShippingMethodConfig_shippingMethodId_fkey" FOREIGN KEY ("shippingMethodId") REFERENCES public."ShippingMethod"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ShippingMethod ShippingMethod_carrierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shippywhippy_admin
--

ALTER TABLE ONLY public."ShippingMethod"
    ADD CONSTRAINT "ShippingMethod_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES public."Carrier"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: shippywhippy_admin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

