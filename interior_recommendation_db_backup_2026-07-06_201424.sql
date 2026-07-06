--
-- PostgreSQL database dump
--

\restrict SChbRDUFddqQJfGZUD8wC6gcBcpZkvj6YlHkaoxaMujhrObDwvoHcGEaS1jFndk

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.product_wishlists DROP CONSTRAINT IF EXISTS product_wishlists_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_wishlists DROP CONSTRAINT IF EXISTS product_wishlists_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_likes DROP CONSTRAINT IF EXISTS product_likes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_likes DROP CONSTRAINT IF EXISTS product_likes_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.interactions DROP CONSTRAINT IF EXISTS interactions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.interactions DROP CONSTRAINT IF EXISTS interactions_product_id_fkey;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP INDEX IF EXISTS public.idx_users_username_unique;
DROP INDEX IF EXISTS public.idx_users_google_id;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_sessions_expire;
DROP INDEX IF EXISTS public.idx_products_status;
DROP INDEX IF EXISTS public.idx_products_metadata;
DROP INDEX IF EXISTS public.idx_products_material_variant;
DROP INDEX IF EXISTS public.idx_products_category;
DROP INDEX IF EXISTS public.idx_product_wishlists_user_product;
DROP INDEX IF EXISTS public.idx_product_wishlists_user_id;
DROP INDEX IF EXISTS public.idx_product_wishlists_product_id;
DROP INDEX IF EXISTS public.idx_product_likes_user_product;
DROP INDEX IF EXISTS public.idx_product_likes_user_id;
DROP INDEX IF EXISTS public.idx_product_likes_product_id;
DROP INDEX IF EXISTS public.idx_interactions_user_product;
DROP INDEX IF EXISTS public.idx_interactions_user_id;
DROP INDEX IF EXISTS public.idx_interactions_type;
DROP INDEX IF EXISTS public.idx_interactions_product_id;
DROP INDEX IF EXISTS public.idx_interactions_created_at;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_google_id_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.product_wishlists DROP CONSTRAINT IF EXISTS product_wishlists_user_product_unique;
ALTER TABLE IF EXISTS ONLY public.product_wishlists DROP CONSTRAINT IF EXISTS product_wishlists_pkey;
ALTER TABLE IF EXISTS ONLY public.product_likes DROP CONSTRAINT IF EXISTS product_likes_user_product_unique;
ALTER TABLE IF EXISTS ONLY public.product_likes DROP CONSTRAINT IF EXISTS product_likes_pkey;
ALTER TABLE IF EXISTS ONLY public.interactions DROP CONSTRAINT IF EXISTS interactions_pkey;
DROP TABLE IF EXISTS public.users;
DROP VIEW IF EXISTS public.user_product_ratings;
DROP VIEW IF EXISTS public.user_product_preference_scores;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.product_wishlists;
DROP TABLE IF EXISTS public.product_likes;
DROP VIEW IF EXISTS public.popular_products;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.interactions;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: interactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    interaction_type character varying(50) NOT NULL,
    weight numeric(3,1) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT interactions_interaction_type_check CHECK (((interaction_type)::text = ANY ((ARRAY['page_view'::character varying, 'like'::character varying, 'favorite'::character varying, 'whatsapp_inquiry'::character varying])::text[]))),
    CONSTRAINT interactions_weight_check CHECK ((weight > (0)::numeric))
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    image_url text NOT NULL,
    category character varying(100) NOT NULL,
    material character varying(100) NOT NULL,
    style_theme character varying(100) NOT NULL,
    dominant_color character varying(100) NOT NULL,
    room_category character varying(100) NOT NULL,
    description text,
    price numeric(12,2) NOT NULL,
    stock integer DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    material_variant character varying(50) DEFAULT 'Tidak Ada'::character varying NOT NULL,
    CONSTRAINT products_category_check CHECK (((category)::text = ANY ((ARRAY['Kitchen Set'::character varying, 'Living Set'::character varying, 'Bedset'::character varying, 'Minibar'::character varying, 'Meja'::character varying, 'Kursi'::character varying, 'Lemari'::character varying, 'Nakas'::character varying, 'Meja Rias'::character varying])::text[]))),
    CONSTRAINT products_material_check CHECK (((material)::text = ANY ((ARRAY['HPL'::character varying, 'Kayu'::character varying, 'Logam'::character varying, 'Kaca'::character varying, 'Linen'::character varying, 'Kayu + Logam'::character varying, 'Logam + Linen'::character varying, 'Kayu + Linen'::character varying, 'HPL + Kaca'::character varying])::text[]))),
    CONSTRAINT products_material_variant_check CHECK (((material_variant)::text = ANY ((ARRAY['Tidak Ada'::character varying, 'Woodgrain'::character varying, 'Solid'::character varying, 'Marble'::character varying, 'Glossy'::character varying])::text[]))),
    CONSTRAINT products_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT products_room_category_check CHECK (((room_category)::text = ANY ((ARRAY['Ruang Tamu'::character varying, 'Ruang Makan'::character varying, 'Dapur'::character varying, 'Kamar Tidur'::character varying, 'Mini Bar'::character varying])::text[]))),
    CONSTRAINT products_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[]))),
    CONSTRAINT products_stock_by_category_check CHECK (((((category)::text = ANY ((ARRAY['Meja'::character varying, 'Kursi'::character varying, 'Lemari'::character varying, 'Nakas'::character varying, 'Meja Rias'::character varying])::text[])) AND (stock IS NOT NULL) AND (stock >= 0)) OR (((category)::text = ANY ((ARRAY['Kitchen Set'::character varying, 'Living Set'::character varying, 'Bedset'::character varying, 'Minibar'::character varying])::text[])) AND (stock IS NULL)))),
    CONSTRAINT products_style_theme_check CHECK (((style_theme)::text = ANY ((ARRAY['Modern'::character varying, 'Minimalis'::character varying, 'Japandi'::character varying])::text[])))
);


--
-- Name: popular_products; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.popular_products AS
 SELECT p.id,
    p.name,
    p.image_url,
    p.category,
    p.material,
    p.style_theme,
    p.dominant_color,
    p.room_category,
    p.description,
    p.price,
    p.stock,
    p.status,
    count(i.id) AS total_interactions,
    COALESCE(sum(i.weight), (0)::numeric) AS popularity_score
   FROM (public.products p
     LEFT JOIN public.interactions i ON ((p.id = i.product_id)))
  WHERE ((p.status)::text = 'active'::text)
  GROUP BY p.id, p.name, p.image_url, p.category, p.material, p.style_theme, p.dominant_color, p.room_category, p.description, p.price, p.stock, p.status
  ORDER BY COALESCE(sum(i.weight), (0)::numeric) DESC, (count(i.id)) DESC, p.name;


--
-- Name: product_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_likes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: product_wishlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_wishlists (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: user_product_preference_scores; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.user_product_preference_scores AS
 WITH user_product_pairs AS (
         SELECT product_likes.user_id,
            product_likes.product_id
           FROM public.product_likes
        UNION
         SELECT product_wishlists.user_id,
            product_wishlists.product_id
           FROM public.product_wishlists
        UNION
         SELECT interactions.user_id,
            interactions.product_id
           FROM public.interactions
          WHERE ((interactions.interaction_type)::text = 'whatsapp_inquiry'::text)
        ), whatsapp_pairs AS (
         SELECT DISTINCT interactions.user_id,
            interactions.product_id
           FROM public.interactions
          WHERE ((interactions.interaction_type)::text = 'whatsapp_inquiry'::text)
        )
 SELECT upp.user_id,
    upp.product_id,
        CASE
            WHEN (pl.user_id IS NOT NULL) THEN 1
            ELSE 0
        END AS active_like,
        CASE
            WHEN (pw.user_id IS NOT NULL) THEN 1
            ELSE 0
        END AS active_wishlist,
        CASE
            WHEN (wp.user_id IS NOT NULL) THEN 1
            ELSE 0
        END AS has_whatsapp_inquiry,
    ((
        CASE
            WHEN (pl.user_id IS NOT NULL) THEN 1.0
            ELSE (0)::numeric
        END +
        CASE
            WHEN (pw.user_id IS NOT NULL) THEN 1.5
            ELSE (0)::numeric
        END) +
        CASE
            WHEN (wp.user_id IS NOT NULL) THEN 2.5
            ELSE (0)::numeric
        END) AS implicit_score,
    (((
        CASE
            WHEN (pl.user_id IS NOT NULL) THEN 1.0
            ELSE (0)::numeric
        END +
        CASE
            WHEN (pw.user_id IS NOT NULL) THEN 1.5
            ELSE (0)::numeric
        END) +
        CASE
            WHEN (wp.user_id IS NOT NULL) THEN 2.5
            ELSE (0)::numeric
        END) / 5.0) AS normalized_score
   FROM (((user_product_pairs upp
     LEFT JOIN public.product_likes pl ON (((pl.user_id = upp.user_id) AND (pl.product_id = upp.product_id))))
     LEFT JOIN public.product_wishlists pw ON (((pw.user_id = upp.user_id) AND (pw.product_id = upp.product_id))))
     LEFT JOIN whatsapp_pairs wp ON (((wp.user_id = upp.user_id) AND (wp.product_id = upp.product_id))))
  WHERE (((
        CASE
            WHEN (pl.user_id IS NOT NULL) THEN 1.0
            ELSE (0)::numeric
        END +
        CASE
            WHEN (pw.user_id IS NOT NULL) THEN 1.5
            ELSE (0)::numeric
        END) +
        CASE
            WHEN (wp.user_id IS NOT NULL) THEN 2.5
            ELSE (0)::numeric
        END) > (0)::numeric);


--
-- Name: user_product_ratings; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.user_product_ratings AS
 SELECT user_id,
    product_id,
    LEAST(sum(weight), 5.0) AS implicit_rating,
    count(*) AS interaction_count,
    max(created_at) AS last_interaction_at
   FROM public.interactions
  GROUP BY user_id, product_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    google_id character varying(255),
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    avatar_url text,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    username character varying(50),
    password_hash text,
    auth_provider character varying(20) DEFAULT 'google'::character varying NOT NULL,
    CONSTRAINT users_auth_provider_check CHECK (((auth_provider)::text = ANY ((ARRAY['google'::character varying, 'local'::character varying])::text[]))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])))
);


--
-- Data for Name: interactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.interactions (id, user_id, product_id, interaction_type, weight, created_at) FROM stdin;
ca3247c8-221f-4429-8823-3ddfcc72db81	e15d492a-b09f-48e2-88be-fee04af9ae03	e79f41ca-25c1-4e7b-87ec-dda873f3144a	whatsapp_inquiry	1.5	2026-06-10 00:52:58.897114
f2d26b50-92cc-4677-9ee8-ec23d4e90d95	e15d492a-b09f-48e2-88be-fee04af9ae03	e79f41ca-25c1-4e7b-87ec-dda873f3144a	favorite	1.5	2026-06-10 00:52:58.897114
e838bbfb-4528-461f-8a62-d54938999fcb	e15d492a-b09f-48e2-88be-fee04af9ae03	e79f41ca-25c1-4e7b-87ec-dda873f3144a	like	1.0	2026-06-10 00:52:58.897114
2751a930-6318-4478-ab5a-a1e27a668dfa	e15d492a-b09f-48e2-88be-fee04af9ae03	e79f41ca-25c1-4e7b-87ec-dda873f3144a	page_view	1.0	2026-06-10 00:52:58.897114
aff09330-45ad-43d3-9bd2-aa62177c3a65	e15d492a-b09f-48e2-88be-fee04af9ae03	9f842a6e-21e7-4e5f-9865-2981dbfdad13	like	1.0	2026-06-10 00:52:58.897114
3fc9ff59-bea4-4d77-b92d-2e0b0a1692b8	e15d492a-b09f-48e2-88be-fee04af9ae03	9f842a6e-21e7-4e5f-9865-2981dbfdad13	page_view	1.0	2026-06-10 00:52:58.897114
c0e45193-8c6d-4b1c-b273-fa89f25387b4	d9f8420e-4355-49b9-90d6-a699cfd5dee5	9c2722e5-ad24-4adf-8eff-99de96bf392e	page_view	1.0	2026-06-10 00:52:58.897114
23e354d6-25dd-43b1-9ee7-04641c8429c3	e15d492a-b09f-48e2-88be-fee04af9ae03	9c2722e5-ad24-4adf-8eff-99de96bf392e	favorite	1.5	2026-06-10 00:52:58.897114
b92327fe-bac0-4fb1-9c2e-40d75fbd3178	e15d492a-b09f-48e2-88be-fee04af9ae03	9c2722e5-ad24-4adf-8eff-99de96bf392e	page_view	1.0	2026-06-10 00:52:58.897114
121a5e28-a0ee-459a-b88f-18f9d12fe285	d9f8420e-4355-49b9-90d6-a699cfd5dee5	6cc14b2e-0e42-4e02-9d66-92a8494e2e46	favorite	1.5	2026-06-10 00:52:58.897114
cde27586-296e-41a8-9f66-257da5f6091c	d9f8420e-4355-49b9-90d6-a699cfd5dee5	6cc14b2e-0e42-4e02-9d66-92a8494e2e46	like	1.0	2026-06-10 00:52:58.897114
b2f6b274-f394-4751-bd43-836271710a83	d9f8420e-4355-49b9-90d6-a699cfd5dee5	6cc14b2e-0e42-4e02-9d66-92a8494e2e46	page_view	1.0	2026-06-10 00:52:58.897114
022820d5-4a7a-44f9-8939-ca0cc80a3b50	d9f8420e-4355-49b9-90d6-a699cfd5dee5	17de4ddb-0a72-4b3e-a519-2bc05590e0b5	favorite	1.5	2026-06-10 00:52:58.897114
b323aed2-a008-4e09-ae15-9dd922bb14df	d9f8420e-4355-49b9-90d6-a699cfd5dee5	17de4ddb-0a72-4b3e-a519-2bc05590e0b5	page_view	1.0	2026-06-10 00:52:58.897114
99038c27-f799-49ed-b389-9d4c7d054c68	d9f8420e-4355-49b9-90d6-a699cfd5dee5	a655c55d-7beb-42bd-bd06-d0c62262d4ad	favorite	1.5	2026-06-10 00:52:58.897114
ae67b57b-5da1-4cd1-b577-d760c1bc7893	d9f8420e-4355-49b9-90d6-a699cfd5dee5	a655c55d-7beb-42bd-bd06-d0c62262d4ad	page_view	1.0	2026-06-10 00:52:58.897114
cc3723ee-163f-4a78-b656-a6026f045a71	d9f8420e-4355-49b9-90d6-a699cfd5dee5	2913d4da-96ad-43cf-8fbb-a6acd06ee956	like	1.0	2026-06-10 00:52:58.897114
092b6e28-2b0f-467b-ab39-65f05adbc2cb	d9f8420e-4355-49b9-90d6-a699cfd5dee5	2913d4da-96ad-43cf-8fbb-a6acd06ee956	page_view	1.0	2026-06-10 00:52:58.897114
86064c7a-65cb-4110-8dde-a4f0291591ff	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	4e6af8c0-20fe-49ed-b1c5-32e67b948144	like	1.0	2026-06-10 00:52:58.897114
1c6a37db-0baf-46ea-b8ae-5702e1a3ccce	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	4e6af8c0-20fe-49ed-b1c5-32e67b948144	page_view	1.0	2026-06-10 00:52:58.897114
790735ba-203c-45b4-934e-8dea27f08e06	e15d492a-b09f-48e2-88be-fee04af9ae03	bcc904c8-c7c9-492d-9225-ba62aaf100fd	page_view	1.0	2026-06-10 00:52:58.897114
dd38565d-2f13-4be0-a898-34078b3e5586	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	a9779898-778c-43f3-8e12-819dfa0cad2a	whatsapp_inquiry	1.5	2026-06-10 00:52:58.897114
51f56647-a7c0-4b7d-bdbb-afe460bf7f56	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	a9779898-778c-43f3-8e12-819dfa0cad2a	favorite	1.5	2026-06-10 00:52:58.897114
98cbdf2a-8fee-440e-bd94-dc0a75566c94	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	a9779898-778c-43f3-8e12-819dfa0cad2a	like	1.0	2026-06-10 00:52:58.897114
82e9429d-71f1-4451-8172-24e73d2decf7	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	a9779898-778c-43f3-8e12-819dfa0cad2a	page_view	1.0	2026-06-10 00:52:58.897114
6bf0f1a5-062c-40f8-a289-2d60b8bed049	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	65e5f39b-3e7e-4097-91b0-24dcd350406a	favorite	1.5	2026-06-10 00:52:58.897114
52cff969-4b1c-41f5-88c3-197a2fbb6680	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	65e5f39b-3e7e-4097-91b0-24dcd350406a	page_view	1.0	2026-06-10 00:52:58.897114
f3b05f39-001b-4228-a3ed-06a98e4eb89e	e15d492a-b09f-48e2-88be-fee04af9ae03	aa2b9b86-9fb2-4946-8ede-d67138c593fb	favorite	1.5	2026-06-10 00:52:58.897114
ca8ff6f8-2f37-4107-81b7-2833cacd2f44	e15d492a-b09f-48e2-88be-fee04af9ae03	aa2b9b86-9fb2-4946-8ede-d67138c593fb	like	1.0	2026-06-10 00:52:58.897114
9cffbb2d-3e21-46c4-932b-7e1d9033424f	e15d492a-b09f-48e2-88be-fee04af9ae03	aa2b9b86-9fb2-4946-8ede-d67138c593fb	page_view	1.0	2026-06-10 00:52:58.897114
9ba04d80-9512-446c-bef4-eb87fa3e6e84	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	d72a01d6-b079-418c-b592-ed7a8f02f225	page_view	1.0	2026-06-10 00:52:58.897114
f37765b0-d0c0-4782-9ca6-8045a39b4380	e15d492a-b09f-48e2-88be-fee04af9ae03	d72a01d6-b079-418c-b592-ed7a8f02f225	like	1.0	2026-06-10 00:52:58.897114
e3ec123c-3594-4693-840a-73ce06497c1b	e15d492a-b09f-48e2-88be-fee04af9ae03	d72a01d6-b079-418c-b592-ed7a8f02f225	page_view	1.0	2026-06-10 00:52:58.897114
19f41bb4-5ad2-4280-9a1d-421e9740845a	d9f8420e-4355-49b9-90d6-a699cfd5dee5	780c0d65-abed-4832-82d8-a163f7ef7f85	page_view	1.0	2026-06-10 00:52:58.897114
4062a5a8-7941-433f-ae0c-da6f11f112b6	e15d492a-b09f-48e2-88be-fee04af9ae03	780c0d65-abed-4832-82d8-a163f7ef7f85	favorite	1.5	2026-06-10 00:52:58.897114
e03f367c-50ad-4f44-85b4-ba8689664243	e15d492a-b09f-48e2-88be-fee04af9ae03	780c0d65-abed-4832-82d8-a163f7ef7f85	page_view	1.0	2026-06-10 00:52:58.897114
00c46676-0ac6-4376-8585-76f212e0f07f	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	5add5056-4b06-4645-9979-fe8a0fe2a5e5	favorite	1.5	2026-06-10 00:52:58.897114
b029219f-007d-496e-be3b-12127c704941	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	5add5056-4b06-4645-9979-fe8a0fe2a5e5	like	1.0	2026-06-10 00:52:58.897114
60d61c66-6e58-4aa8-a874-dc43d3f5bced	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	5add5056-4b06-4645-9979-fe8a0fe2a5e5	page_view	1.0	2026-06-10 00:52:58.897114
a6b1ec94-4040-4b4e-8a07-aabe972b6a9f	e15d492a-b09f-48e2-88be-fee04af9ae03	9db537e2-1a25-425c-8092-02a510602097	like	1.0	2026-06-10 00:52:58.897114
ead47645-8e77-40f3-bdc0-26dcc5109a3e	e15d492a-b09f-48e2-88be-fee04af9ae03	9db537e2-1a25-425c-8092-02a510602097	page_view	1.0	2026-06-10 00:52:58.897114
3cafe934-ad8f-4007-b43b-085619351f26	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	dc759ac0-1f81-4d8c-83ab-8caeee4dbf71	favorite	1.5	2026-06-10 00:52:58.897114
e1cf89df-d68f-4801-98aa-b5bcc6500d80	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	dc759ac0-1f81-4d8c-83ab-8caeee4dbf71	like	1.0	2026-06-10 00:52:58.897114
5c9a9ee9-bdc8-4d49-989f-2f52378c5bf6	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	dc759ac0-1f81-4d8c-83ab-8caeee4dbf71	page_view	1.0	2026-06-10 00:52:58.897114
6ecccda2-51d7-4b4a-8eaa-53bf9ab62d34	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	50985a09-dfc3-4aec-a93e-ec79c515d4e6	like	1.0	2026-06-10 00:52:58.897114
4618fda3-5fde-4db2-8ac9-54419910b13d	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	50985a09-dfc3-4aec-a93e-ec79c515d4e6	page_view	1.0	2026-06-10 00:52:58.897114
d10df03c-7c16-4072-a379-d99e421d2dd5	d9f8420e-4355-49b9-90d6-a699cfd5dee5	1a1481df-1e9b-47ae-9366-5b67913013d4	whatsapp_inquiry	1.5	2026-06-10 00:52:58.897114
54e0c865-36de-4890-b21b-432856272492	d9f8420e-4355-49b9-90d6-a699cfd5dee5	1a1481df-1e9b-47ae-9366-5b67913013d4	favorite	1.5	2026-06-10 00:52:58.897114
7d9267ff-00f4-43f0-8f16-c780de1f613e	d9f8420e-4355-49b9-90d6-a699cfd5dee5	1a1481df-1e9b-47ae-9366-5b67913013d4	like	1.0	2026-06-10 00:52:58.897114
43498e10-a9bd-4d21-b709-07128cd9c80b	d9f8420e-4355-49b9-90d6-a699cfd5dee5	1a1481df-1e9b-47ae-9366-5b67913013d4	page_view	1.0	2026-06-10 00:52:58.897114
54616eda-c438-4831-a569-66273248a00e	d9f8420e-4355-49b9-90d6-a699cfd5dee5	63690689-4252-479f-813d-948394d9f500	like	1.0	2026-06-10 00:52:58.897114
05361d2b-c601-47bc-b858-18afdf846b92	d9f8420e-4355-49b9-90d6-a699cfd5dee5	63690689-4252-479f-813d-948394d9f500	page_view	1.0	2026-06-10 00:52:58.897114
f4d1eaa4-6623-4f3e-9b5d-53a37afc751d	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	3826994f-d4f7-4a9d-a013-e840169fbc69	like	1.0	2026-06-10 00:52:58.897114
e3898fc0-0a2b-40fd-94a6-256d4e5195b9	7e8c8b40-176c-4eb6-97b2-a39da4acf39b	3826994f-d4f7-4a9d-a013-e840169fbc69	page_view	1.0	2026-06-10 00:52:58.897114
e240703b-9527-49c2-bfe8-b5193fd62af4	e15d492a-b09f-48e2-88be-fee04af9ae03	c2970d6c-23c2-4eba-9d15-4995a3a86f23	like	1.0	2026-06-10 00:52:58.897114
191d1df4-c00e-46ac-86fb-33e09e7f8ade	e15d492a-b09f-48e2-88be-fee04af9ae03	c2970d6c-23c2-4eba-9d15-4995a3a86f23	page_view	1.0	2026-06-10 00:52:58.897114
637497c6-138f-4b3b-b3f4-e354c4d52a0f	5e2d1a3f-1bbc-4085-a2e7-7ac50a74f8b8	1a1481df-1e9b-47ae-9366-5b67913013d4	page_view	1.0	2026-06-10 03:17:35.225164
57b7e222-5a33-463b-b43e-8e59ec6bc345	5e2d1a3f-1bbc-4085-a2e7-7ac50a74f8b8	1a1481df-1e9b-47ae-9366-5b67913013d4	like	1.0	2026-06-10 03:17:37.889319
154a1689-c6f2-4172-9001-4613ab792ee8	5e2d1a3f-1bbc-4085-a2e7-7ac50a74f8b8	1a1481df-1e9b-47ae-9366-5b67913013d4	favorite	1.5	2026-06-10 03:17:40.161005
e710d9a4-20b1-408d-a13a-5117b863db1e	5e2d1a3f-1bbc-4085-a2e7-7ac50a74f8b8	1a1481df-1e9b-47ae-9366-5b67913013d4	favorite	1.5	2026-06-10 03:17:41.761759
40426529-89f3-4f62-8eef-b1a598cf24cd	5e2d1a3f-1bbc-4085-a2e7-7ac50a74f8b8	1a1481df-1e9b-47ae-9366-5b67913013d4	whatsapp_inquiry	1.5	2026-06-10 03:17:50.143092
73d62c12-274b-4f84-8ad1-c257df46a6b0	5e2d1a3f-1bbc-4085-a2e7-7ac50a74f8b8	1a1481df-1e9b-47ae-9366-5b67913013d4	like	1.0	2026-06-10 03:18:29.318716
72e908c0-6b2e-42c2-bfd1-c380e805c49e	5e2d1a3f-1bbc-4085-a2e7-7ac50a74f8b8	1a1481df-1e9b-47ae-9366-5b67913013d4	like	1.0	2026-06-10 03:18:30.395049
a075e954-91d5-43d8-a57d-bf7936ddfe30	203a1744-a19f-4780-8834-2cbfc5e39d00	e79f41ca-25c1-4e7b-87ec-dda873f3144a	like	1.0	2026-06-10 13:06:01.505797
a63ab1bf-03c2-4901-9eaf-37181acb9725	203a1744-a19f-4780-8834-2cbfc5e39d00	e79f41ca-25c1-4e7b-87ec-dda873f3144a	favorite	1.5	2026-06-10 13:06:01.578867
8438251e-3df3-4222-93fd-8ca3c641d099	0b8676fd-ee36-40c3-b57e-8a7d0d5e3aa4	1a1481df-1e9b-47ae-9366-5b67913013d4	page_view	1.0	2026-06-10 13:37:08.95429
cd0d94d0-396d-4429-b713-00c92bf8b99a	0b8676fd-ee36-40c3-b57e-8a7d0d5e3aa4	1a1481df-1e9b-47ae-9366-5b67913013d4	like	1.0	2026-06-10 13:37:11.635118
0bf69776-1782-4e99-a233-2cc519e7832c	0b8676fd-ee36-40c3-b57e-8a7d0d5e3aa4	1a1481df-1e9b-47ae-9366-5b67913013d4	favorite	1.5	2026-06-10 13:37:19.14187
bea78c4b-0aa8-43f6-9bf9-bc1bccfa4b1f	0b8676fd-ee36-40c3-b57e-8a7d0d5e3aa4	1a1481df-1e9b-47ae-9366-5b67913013d4	favorite	1.5	2026-06-10 13:37:24.952422
f3209dd6-d3c9-4c36-ab4f-35acffbf48cb	a9220074-5cef-4591-b6ad-0833bc7ac532	5add5056-4b06-4645-9979-fe8a0fe2a5e5	page_view	1.0	2026-06-10 16:18:10.672631
690bf547-ed32-4648-a6ec-9df0093be157	a9220074-5cef-4591-b6ad-0833bc7ac532	5add5056-4b06-4645-9979-fe8a0fe2a5e5	like	1.0	2026-06-10 16:18:15.549532
b27a2f87-5e93-4db2-8740-d1193e2000fd	a9220074-5cef-4591-b6ad-0833bc7ac532	5add5056-4b06-4645-9979-fe8a0fe2a5e5	favorite	1.5	2026-06-10 16:18:16.981824
9c598a8a-89f6-4980-8bd4-ff55a7b459c4	a9220074-5cef-4591-b6ad-0833bc7ac532	780c0d65-abed-4832-82d8-a163f7ef7f85	page_view	1.0	2026-06-10 18:23:48.227382
dfe3ec57-8e0f-43e3-a88a-41425c03c715	a9220074-5cef-4591-b6ad-0833bc7ac532	780c0d65-abed-4832-82d8-a163f7ef7f85	like	1.0	2026-06-10 18:23:50.931401
4c8b0620-8e0c-4889-a973-f7d3fdbd40eb	a9220074-5cef-4591-b6ad-0833bc7ac532	780c0d65-abed-4832-82d8-a163f7ef7f85	favorite	1.5	2026-06-10 18:23:52.194117
8d494a29-2446-421e-b2c8-9e3919392078	a9220074-5cef-4591-b6ad-0833bc7ac532	780c0d65-abed-4832-82d8-a163f7ef7f85	whatsapp_inquiry	1.5	2026-06-10 18:23:54.720739
7fbfac99-3eb2-4b37-87f2-977dea7d9816	a9220074-5cef-4591-b6ad-0833bc7ac532	dfe998c7-6ad3-4848-a2e1-bdef13a71f6b	page_view	1.0	2026-06-10 19:00:43.856792
2abb17c2-e455-4196-89c0-f199ed7af1e2	a9220074-5cef-4591-b6ad-0833bc7ac532	65e5f39b-3e7e-4097-91b0-24dcd350406a	page_view	1.0	2026-06-10 19:07:22.270651
1936a58b-45c3-43a0-98ce-e6f915cd34de	a9220074-5cef-4591-b6ad-0833bc7ac532	65e5f39b-3e7e-4097-91b0-24dcd350406a	page_view	1.0	2026-06-10 19:07:42.042172
332c74d9-9f0b-46dc-969d-0fcf4e3c49dc	a9220074-5cef-4591-b6ad-0833bc7ac532	aa2b9b86-9fb2-4946-8ede-d67138c593fb	page_view	1.0	2026-06-10 19:51:04.739796
c490daf3-3f2e-494a-a2ab-d97f7fe530bd	a9220074-5cef-4591-b6ad-0833bc7ac532	dc759ac0-1f81-4d8c-83ab-8caeee4dbf71	page_view	1.0	2026-06-10 19:51:54.299258
a92c2429-5b1d-4ee4-afea-34f5ad83ec7a	a9220074-5cef-4591-b6ad-0833bc7ac532	a9779898-778c-43f3-8e12-819dfa0cad2a	page_view	1.0	2026-06-11 20:32:18.443059
225bbfd4-15c1-4027-ba1e-21e3d9094285	a9220074-5cef-4591-b6ad-0833bc7ac532	a9779898-778c-43f3-8e12-819dfa0cad2a	like	1.0	2026-06-11 20:32:19.573099
1aa7aa3c-125a-44d9-be12-e726f144ca11	a9220074-5cef-4591-b6ad-0833bc7ac532	a9779898-778c-43f3-8e12-819dfa0cad2a	whatsapp_inquiry	1.5	2026-06-11 20:32:22.629024
147878ff-884d-4369-ba31-72218f166a9b	a9220074-5cef-4591-b6ad-0833bc7ac532	a9779898-778c-43f3-8e12-819dfa0cad2a	page_view	1.0	2026-06-11 20:32:46.061909
c90231d2-6eb2-4068-8862-e815d24a9853	a9220074-5cef-4591-b6ad-0833bc7ac532	d72a01d6-b079-418c-b592-ed7a8f02f225	page_view	1.0	2026-06-11 20:33:03.893209
1e8d2907-1e85-40a3-9181-34c86331ccca	a9220074-5cef-4591-b6ad-0833bc7ac532	d72a01d6-b079-418c-b592-ed7a8f02f225	page_view	1.0	2026-06-11 20:33:05.116531
f0482d3e-b440-4bab-8487-5ed941ea3b3d	a9220074-5cef-4591-b6ad-0833bc7ac532	d72a01d6-b079-418c-b592-ed7a8f02f225	page_view	1.0	2026-06-11 20:33:06.299067
b987588b-8709-43d5-b203-3909695c040f	a9220074-5cef-4591-b6ad-0833bc7ac532	d72a01d6-b079-418c-b592-ed7a8f02f225	page_view	1.0	2026-06-11 20:33:08.771631
3d6a07ff-e389-4500-b1e1-ca278174d5ac	a9220074-5cef-4591-b6ad-0833bc7ac532	97f4b662-56b8-4d86-a215-bf99d80c4e2e	page_view	1.0	2026-06-11 20:33:15.00025
b3b80993-5ad5-4e46-b62e-e5ebf1039885	a9220074-5cef-4591-b6ad-0833bc7ac532	9db537e2-1a25-425c-8092-02a510602097	page_view	1.0	2026-06-11 20:33:23.874386
2c4e9a06-52ba-43b1-b4e3-1a27e06999eb	a9220074-5cef-4591-b6ad-0833bc7ac532	bcc904c8-c7c9-492d-9225-ba62aaf100fd	page_view	1.0	2026-06-11 20:49:07.26265
64e7520a-867f-4250-a7f0-83617ddf0017	a9220074-5cef-4591-b6ad-0833bc7ac532	50985a09-dfc3-4aec-a93e-ec79c515d4e6	page_view	1.0	2026-06-12 15:49:04.823554
8956ae20-2aa0-41c0-aa1a-76366dd0bc3e	a9220074-5cef-4591-b6ad-0833bc7ac532	50985a09-dfc3-4aec-a93e-ec79c515d4e6	page_view	1.0	2026-06-12 15:49:15.484973
5fee2c85-d4ec-435d-bf18-ea27edbb81f3	a9220074-5cef-4591-b6ad-0833bc7ac532	50985a09-dfc3-4aec-a93e-ec79c515d4e6	page_view	1.0	2026-06-12 15:50:50.2854
f74abc09-1f2c-4ee1-b148-60afa87fff01	a9220074-5cef-4591-b6ad-0833bc7ac532	50985a09-dfc3-4aec-a93e-ec79c515d4e6	page_view	1.0	2026-06-12 15:50:54.235899
c67c05b2-27b6-4a2f-bc89-ba521fcd6535	a9220074-5cef-4591-b6ad-0833bc7ac532	5add5056-4b06-4645-9979-fe8a0fe2a5e5	page_view	1.0	2026-06-12 19:19:25.58459
f4f36018-2759-4de7-9a74-2b44d35300af	a9220074-5cef-4591-b6ad-0833bc7ac532	e79f41ca-25c1-4e7b-87ec-dda873f3144a	page_view	1.0	2026-06-12 19:20:05.960019
cfd41961-dcf3-4cc2-9c62-d42ca495576c	a9220074-5cef-4591-b6ad-0833bc7ac532	e79f41ca-25c1-4e7b-87ec-dda873f3144a	like	1.0	2026-06-12 19:20:07.566459
1ceaaf12-1c74-47c5-8d82-176d29c4b001	a9220074-5cef-4591-b6ad-0833bc7ac532	e79f41ca-25c1-4e7b-87ec-dda873f3144a	like	1.0	2026-06-12 19:20:10.76838
da0ed00f-8758-46d6-9213-3e976225716d	a9220074-5cef-4591-b6ad-0833bc7ac532	e79f41ca-25c1-4e7b-87ec-dda873f3144a	whatsapp_inquiry	1.5	2026-06-12 19:20:12.056419
330b8eeb-4fa0-4050-abad-b74f1e7910bc	a9220074-5cef-4591-b6ad-0833bc7ac532	d3bac6e2-24a0-4afe-acb0-b39797ceb38f	page_view	1.0	2026-06-12 19:20:20.334058
298384a0-9d98-4372-9256-24def2dbdda2	a9220074-5cef-4591-b6ad-0833bc7ac532	d3bac6e2-24a0-4afe-acb0-b39797ceb38f	like	1.0	2026-06-12 19:20:21.634178
6d8a14e0-ccf1-443e-a822-16a2f67e0eed	a9220074-5cef-4591-b6ad-0833bc7ac532	d3bac6e2-24a0-4afe-acb0-b39797ceb38f	favorite	1.5	2026-06-12 19:20:23.582519
f3c93581-9af0-464a-b917-a045fa160fc6	a9220074-5cef-4591-b6ad-0833bc7ac532	2913d4da-96ad-43cf-8fbb-a6acd06ee956	page_view	1.0	2026-06-12 19:20:32.110681
11b97776-b141-4083-847e-5d128faef236	a9220074-5cef-4591-b6ad-0833bc7ac532	2913d4da-96ad-43cf-8fbb-a6acd06ee956	like	1.0	2026-06-12 19:20:33.458429
777b393c-d4b8-4867-8fcf-24e57959f485	a9220074-5cef-4591-b6ad-0833bc7ac532	2913d4da-96ad-43cf-8fbb-a6acd06ee956	favorite	1.5	2026-06-12 19:20:33.998053
4d83d284-df4b-4945-8c9e-d09c783b5585	a9220074-5cef-4591-b6ad-0833bc7ac532	a655c55d-7beb-42bd-bd06-d0c62262d4ad	page_view	1.0	2026-06-12 19:20:36.803094
fcd97e0a-73a8-4e2b-b3c3-fec62e044519	a9220074-5cef-4591-b6ad-0833bc7ac532	a655c55d-7beb-42bd-bd06-d0c62262d4ad	like	1.0	2026-06-12 19:20:40.365972
ef72fa31-cb87-401b-a73a-c1eac2ea0af6	a9220074-5cef-4591-b6ad-0833bc7ac532	a655c55d-7beb-42bd-bd06-d0c62262d4ad	favorite	1.5	2026-06-12 19:20:41.71915
e44d3e15-cd79-4f25-a53c-f663696aebf2	a9220074-5cef-4591-b6ad-0833bc7ac532	a655c55d-7beb-42bd-bd06-d0c62262d4ad	page_view	1.0	2026-06-13 12:07:03.845463
c2b1996c-a3ad-48d6-8cea-4e7c691844eb	a9220074-5cef-4591-b6ad-0833bc7ac532	9c2722e5-ad24-4adf-8eff-99de96bf392e	page_view	1.0	2026-06-13 12:07:07.422561
7bcf58db-fafe-477f-b0cf-d5965c71ddd3	a9220074-5cef-4591-b6ad-0833bc7ac532	9c2722e5-ad24-4adf-8eff-99de96bf392e	page_view	1.0	2026-06-13 12:07:20.556346
b2d81d45-83ca-46d1-81ab-8aebfef2a008	a9220074-5cef-4591-b6ad-0833bc7ac532	a655c55d-7beb-42bd-bd06-d0c62262d4ad	page_view	1.0	2026-06-13 12:07:38.663101
fba3109a-5e63-4ba3-80e7-786dd9f7ca90	a9220074-5cef-4591-b6ad-0833bc7ac532	63690689-4252-479f-813d-948394d9f500	page_view	1.0	2026-06-13 13:17:19.989078
9335397e-affa-4cd1-a3ea-5773fd927a84	a9220074-5cef-4591-b6ad-0833bc7ac532	0cee047b-c465-4964-a22e-c1a8f4e6bf85	page_view	1.0	2026-06-13 13:17:42.450147
5fbeecf1-8948-427e-a02a-cd67c09c8c30	a9220074-5cef-4591-b6ad-0833bc7ac532	17de4ddb-0a72-4b3e-a519-2bc05590e0b5	page_view	1.0	2026-06-13 13:17:55.709337
d27f2b5c-d766-4062-a47e-48dfe3b79305	a9220074-5cef-4591-b6ad-0833bc7ac532	4e6af8c0-20fe-49ed-b1c5-32e67b948144	page_view	1.0	2026-06-13 13:18:09.557621
71a69f74-41d8-4cab-86c9-c25c76f82d11	a9220074-5cef-4591-b6ad-0833bc7ac532	4e6af8c0-20fe-49ed-b1c5-32e67b948144	page_view	1.0	2026-06-13 13:19:37.484022
ca48f1ec-ac0a-404e-a790-b50cb14a4d4b	a9220074-5cef-4591-b6ad-0833bc7ac532	9f842a6e-21e7-4e5f-9865-2981dbfdad13	page_view	1.0	2026-06-13 13:19:53.709333
c5a0471e-bfe3-4dc5-85f6-1825b5f34fc3	a9220074-5cef-4591-b6ad-0833bc7ac532	9f842a6e-21e7-4e5f-9865-2981dbfdad13	page_view	1.0	2026-06-13 13:20:46.984906
ae27146d-b6cb-4872-9d4c-40fc907f0e08	a9220074-5cef-4591-b6ad-0833bc7ac532	6cc14b2e-0e42-4e02-9d66-92a8494e2e46	page_view	1.0	2026-06-13 13:36:15.730791
75eb8d22-2db6-4eb8-904f-2990630bacec	15c78fa4-181e-4949-9c87-b93d6cbff62e	a9779898-778c-43f3-8e12-819dfa0cad2a	page_view	1.0	2026-06-13 15:54:30.402877
1f91e9bf-e9e3-4284-ad81-3538a5b3bb2d	15c78fa4-181e-4949-9c87-b93d6cbff62e	5add5056-4b06-4645-9979-fe8a0fe2a5e5	page_view	1.0	2026-06-13 15:55:06.458345
3ac94e2b-f8be-4f6b-9594-ef6105d7af84	15c78fa4-181e-4949-9c87-b93d6cbff62e	dc759ac0-1f81-4d8c-83ab-8caeee4dbf71	page_view	1.0	2026-06-13 15:55:23.642675
64403fcb-e638-4ec2-b2f6-7a0de21d5f43	15c78fa4-181e-4949-9c87-b93d6cbff62e	dc759ac0-1f81-4d8c-83ab-8caeee4dbf71	like	1.0	2026-06-13 15:55:26.676695
26a4a10e-7397-4c0d-be39-12524feaae2f	15c78fa4-181e-4949-9c87-b93d6cbff62e	dc759ac0-1f81-4d8c-83ab-8caeee4dbf71	favorite	1.5	2026-06-13 15:55:27.358247
630efc46-4844-4b3d-b0bc-f1009ba45894	15c78fa4-181e-4949-9c87-b93d6cbff62e	0cee047b-c465-4964-a22e-c1a8f4e6bf85	page_view	1.0	2026-06-13 15:55:28.236765
8efca1d0-ce2e-4353-a1a0-ca68c9fedb97	15c78fa4-181e-4949-9c87-b93d6cbff62e	0cee047b-c465-4964-a22e-c1a8f4e6bf85	like	1.0	2026-06-13 15:55:29.143887
c6838db0-7993-4d15-982f-bc5f1a4c321b	15c78fa4-181e-4949-9c87-b93d6cbff62e	0cee047b-c465-4964-a22e-c1a8f4e6bf85	favorite	1.5	2026-06-13 15:55:29.812693
31f87f65-6654-4d8c-8164-befc5cdd6cd3	15c78fa4-181e-4949-9c87-b93d6cbff62e	5add5056-4b06-4645-9979-fe8a0fe2a5e5	page_view	1.0	2026-06-13 15:55:43.996818
821e5393-1bc8-4f6f-aa45-d24a691cd556	15c78fa4-181e-4949-9c87-b93d6cbff62e	5add5056-4b06-4645-9979-fe8a0fe2a5e5	like	1.0	2026-06-13 15:55:45.205127
d5594ac6-4b25-4448-9373-0c4041b65223	15c78fa4-181e-4949-9c87-b93d6cbff62e	5add5056-4b06-4645-9979-fe8a0fe2a5e5	favorite	1.5	2026-06-13 15:55:46.039412
9f6e1b67-2526-41b8-b124-d27915a333ea	15c78fa4-181e-4949-9c87-b93d6cbff62e	5add5056-4b06-4645-9979-fe8a0fe2a5e5	whatsapp_inquiry	1.5	2026-06-13 15:55:47.25172
116f048f-2d7e-4a60-ab57-d1556dbc0362	15c78fa4-181e-4949-9c87-b93d6cbff62e	5add5056-4b06-4645-9979-fe8a0fe2a5e5	page_view	1.0	2026-06-13 15:55:53.200571
805ec5e8-10c6-4766-bcfc-07d4579233e6	15c78fa4-181e-4949-9c87-b93d6cbff62e	5add5056-4b06-4645-9979-fe8a0fe2a5e5	page_view	1.0	2026-06-13 15:55:54.744836
d4bc1f08-33f5-436a-90b3-51ac874521fa	a9220074-5cef-4591-b6ad-0833bc7ac532	d3bac6e2-24a0-4afe-acb0-b39797ceb38f	page_view	1.0	2026-06-13 17:04:34.648759
b79ae39c-f94c-4663-ae89-2a5f68c3c5be	a9220074-5cef-4591-b6ad-0833bc7ac532	d3bac6e2-24a0-4afe-acb0-b39797ceb38f	page_view	1.0	2026-06-13 17:04:48.500876
21d4af45-5a05-4401-9a6a-ba27d59d7e0f	a9220074-5cef-4591-b6ad-0833bc7ac532	d3bac6e2-24a0-4afe-acb0-b39797ceb38f	page_view	1.0	2026-06-13 17:14:03.063493
23138d38-f81e-4742-8241-fc3694a50129	15c78fa4-181e-4949-9c87-b93d6cbff62e	97f4b662-56b8-4d86-a215-bf99d80c4e2e	page_view	1.0	2026-06-13 17:32:52.530207
0a4a92c4-530a-4812-abff-2e304d106103	98513440-1173-48c4-bc5f-feb4ac0d1a1a	6ab4f64a-f12e-4a4b-a454-792c77503d01	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
55f3faf5-de48-44ac-9afc-63aedd392b7a	98513440-1173-48c4-bc5f-feb4ac0d1a1a	e4e5b95a-1fe1-4365-88a9-6acbdbe0014a	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
dbd92cf4-6f18-4801-8ce1-7e84cf705ed2	e836a5a4-dddc-4c8b-a9ed-5eb1f6f0b3b6	e5b4500b-a6c8-41b4-9363-637ee8b28b59	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
a030807b-82af-4353-9ee4-3a79019b2718	e836a5a4-dddc-4c8b-a9ed-5eb1f6f0b3b6	e53634db-7e04-449e-9ef7-eabecf4306f1	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
b3691c8c-4883-409d-827d-885fd8b565a9	72eb5795-6e8f-401c-bb38-6935f94d50a5	7ef2f523-8ce5-46a4-9bac-7d39c2df82e5	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
b4e1fae4-05ad-4f34-a39e-d6e8f45eb31c	72eb5795-6e8f-401c-bb38-6935f94d50a5	11eb78a2-d137-4055-ae4d-af6956c087fc	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
3a78f9b3-375a-46c8-8c19-3b51cb1f64a6	3fe804ac-e4fa-45d6-a957-5eedb344cf34	f21f6c9f-8c15-48a7-8c28-0aaa6f6f601c	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
d491d92f-a59e-4b55-9723-3629bc3ec767	d65bd0aa-ae34-438c-b739-9b8cac0debf7	e78ee996-d80f-4e21-b223-ef8d6b5d7b01	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
b0fbab2e-6a0d-4e08-8604-cd723776de62	753e480b-b90f-4e3e-9eb2-43dc15f2ce53	c2aa29d9-cac6-4c13-83ca-7e6c9600119d	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
7d14b336-aa2a-4f78-a7e1-1fc7ed9a7d14	886997b8-f78b-4c96-a236-f96367cd627f	9cd507be-1871-4a4c-a507-8e5609c97e36	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
0149747a-b0d3-415c-ad44-4e6f19721817	d7c42c6f-2272-42f8-bd70-e7266f387022	8c7a0263-f3bc-4eaa-a51a-e8fb4290ade2	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
60625901-5196-4164-bf5a-b82075a84306	cc8c3c7f-702f-4cd2-ad2d-ad8659328dca	46a0030a-662c-4baf-a95a-dc28b6a5db09	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
610976c1-ef2a-4c01-ae34-01d2391d359f	6343cd38-881a-41fa-9ca4-d154a8fde81b	0285c0fe-d977-4a9f-8ff6-d38caef991b2	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
21767a05-008f-45b6-9830-5bdba42f8d40	f07f617a-9830-4b62-8751-bb062f69a49a	db1ff15e-6cd1-4ba5-86ab-67951b1e8a07	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
e19bbb08-e8a7-4a4a-bdb3-2cf75499a9ab	25640b49-b7ce-401e-9e44-38b5074375b2	7ef2f523-8ce5-46a4-9bac-7d39c2df82e5	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
8c09f5f7-a29a-4b38-a604-f07cf2af720a	25640b49-b7ce-401e-9e44-38b5074375b2	c40a8a92-f264-4fb5-9de5-441e037fd913	whatsapp_inquiry	2.5	2026-06-13 17:58:55.502698
8d693d09-6504-4d4d-b3cc-474a753dd354	15c78fa4-181e-4949-9c87-b93d6cbff62e	7ef2f523-8ce5-46a4-9bac-7d39c2df82e5	page_view	1.0	2026-06-13 18:24:38.687511
5ca492a1-a640-4dbc-abe3-9f7791ed0d61	15c78fa4-181e-4949-9c87-b93d6cbff62e	7ef2f523-8ce5-46a4-9bac-7d39c2df82e5	like	1.0	2026-06-13 18:24:49.635529
e9dc9b40-c850-4828-ae98-fcf0d645035b	15c78fa4-181e-4949-9c87-b93d6cbff62e	7ef2f523-8ce5-46a4-9bac-7d39c2df82e5	favorite	1.5	2026-06-13 18:24:50.389823
bebd0627-03f4-4888-9355-639cbe578f2a	563d7996-cb3c-4973-8bf0-6c665723de8f	e78ee996-d80f-4e21-b223-ef8d6b5d7b01	page_view	1.0	2026-06-13 19:57:18.207864
3421c606-3af5-4555-8739-f8895f51ac7e	a9220074-5cef-4591-b6ad-0833bc7ac532	2961254f-64cd-4f42-a7cd-118b9bcb2355	page_view	1.0	2026-06-20 02:52:38.910632
7579b062-8be5-441e-9253-70818c8036db	a9220074-5cef-4591-b6ad-0833bc7ac532	2961254f-64cd-4f42-a7cd-118b9bcb2355	like	1.0	2026-06-20 02:52:40.910506
5e3a8945-624f-4394-b557-1faf5ef2247b	99d53037-35b0-4dc6-8482-b86c4385bcda	5919e0cb-a628-4df0-a83a-39915fa4b25f	page_view	1.0	2026-06-20 03:05:17.381066
d817e2b2-2a9a-43ab-9f05-830e29b6b027	99d53037-35b0-4dc6-8482-b86c4385bcda	4bcc38a2-2682-4dec-9345-3af476d6c191	page_view	1.0	2026-06-20 03:05:56.966726
b08947ff-f4f8-4220-9758-a0ac20ddbc0a	99d53037-35b0-4dc6-8482-b86c4385bcda	7490f38a-1d8a-4eb2-857d-f17aedba936d	page_view	1.0	2026-06-20 03:06:06.365984
d779fbfa-38e3-4600-822a-dbc0bca2fc01	99d53037-35b0-4dc6-8482-b86c4385bcda	e78ee996-d80f-4e21-b223-ef8d6b5d7b01	page_view	1.0	2026-06-20 03:37:28.08809
4bc9ce90-55f7-40a2-a4e2-696dcdd057cb	99d53037-35b0-4dc6-8482-b86c4385bcda	e78ee996-d80f-4e21-b223-ef8d6b5d7b01	like	1.0	2026-06-20 03:37:29.775503
50c8d0ca-97a8-48ce-a9d0-eaef78e94eaf	99d53037-35b0-4dc6-8482-b86c4385bcda	e53634db-7e04-449e-9ef7-eabecf4306f1	page_view	1.0	2026-06-20 03:37:32.577777
40b4b2d1-2a34-4624-b54d-9c4f3d3889a1	99d53037-35b0-4dc6-8482-b86c4385bcda	e53634db-7e04-449e-9ef7-eabecf4306f1	favorite	1.5	2026-06-20 03:37:33.573618
ca05a5fb-adb5-4af2-845a-47e33a560693	99d53037-35b0-4dc6-8482-b86c4385bcda	1bd28939-88cf-4937-b3a6-64a3bc071a75	page_view	1.0	2026-06-20 03:37:35.779163
5dc0cdad-1a25-4e6c-995a-35ac9d6c0455	99d53037-35b0-4dc6-8482-b86c4385bcda	1bd28939-88cf-4937-b3a6-64a3bc071a75	like	1.0	2026-06-20 03:37:37.273681
fc4e8344-7288-4106-86da-0037ea80944d	99d53037-35b0-4dc6-8482-b86c4385bcda	1bd28939-88cf-4937-b3a6-64a3bc071a75	favorite	1.5	2026-06-20 03:37:37.620117
e92fcc6d-1abb-43ac-94f6-0eb9e3ccbcf1	99d53037-35b0-4dc6-8482-b86c4385bcda	2bb5ea6f-9f28-4d1b-994c-9323df7070e0	page_view	1.0	2026-06-20 03:37:40.070841
2c21efd1-bfee-455e-8787-ad6586313f9d	99d53037-35b0-4dc6-8482-b86c4385bcda	2bb5ea6f-9f28-4d1b-994c-9323df7070e0	favorite	1.5	2026-06-20 03:37:41.024794
f900e471-54e9-4c26-8b2d-ca487ca380f7	99d53037-35b0-4dc6-8482-b86c4385bcda	2bb5ea6f-9f28-4d1b-994c-9323df7070e0	like	1.0	2026-06-20 03:37:41.384383
78467ca7-5396-4c26-9b9e-dbce94eb8b3a	99d53037-35b0-4dc6-8482-b86c4385bcda	9301fa41-e4af-48ef-b935-49e4806bf378	page_view	1.0	2026-06-20 03:37:45.791473
45f3e0ea-9cb0-415f-94ee-ef6fea1311f7	99d53037-35b0-4dc6-8482-b86c4385bcda	9301fa41-e4af-48ef-b935-49e4806bf378	favorite	1.5	2026-06-20 03:37:46.814136
30239328-76d6-4fff-b9b9-652f11dd1e26	99d53037-35b0-4dc6-8482-b86c4385bcda	feba5885-7b1a-4baf-a37f-babbbb1c9bb8	page_view	1.0	2026-07-06 16:24:58.178909
b1f3a5a8-b4c0-41ca-ad65-3d9a8de86235	99d53037-35b0-4dc6-8482-b86c4385bcda	feba5885-7b1a-4baf-a37f-babbbb1c9bb8	like	1.0	2026-07-06 16:25:01.262783
4a10b046-6780-4143-8223-23b59102260b	99d53037-35b0-4dc6-8482-b86c4385bcda	feba5885-7b1a-4baf-a37f-babbbb1c9bb8	favorite	1.5	2026-07-06 16:25:02.333499
240429a4-0e7c-4364-a677-807d1d74d952	99d53037-35b0-4dc6-8482-b86c4385bcda	6ead8a20-3783-4d00-a026-04e49e0270fd	page_view	1.0	2026-07-06 16:25:09.743685
942b726d-4b71-4d5e-8ee9-cfddebdf60c7	99d53037-35b0-4dc6-8482-b86c4385bcda	6ead8a20-3783-4d00-a026-04e49e0270fd	like	1.0	2026-07-06 16:25:12.075681
fa56bd96-737f-40d6-aec1-65e8ebd3bc59	99d53037-35b0-4dc6-8482-b86c4385bcda	a159fdec-08e3-4641-b8ce-161082cee933	page_view	1.0	2026-07-06 16:26:07.166858
855166ad-7656-4b8e-b31b-80b8f7c42558	a9220074-5cef-4591-b6ad-0833bc7ac532	8b13d763-9ca9-4902-9ed4-60579b43609e	page_view	1.0	2026-07-06 16:29:29.836877
\.


--
-- Data for Name: product_likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_likes (id, user_id, product_id, created_at) FROM stdin;
7b370a6f-a5a0-4bd2-acd4-bd9916ac3064	98513440-1173-48c4-bc5f-feb4ac0d1a1a	6ab4f64a-f12e-4a4b-a454-792c77503d01	2026-06-13 17:58:55.502698
0c8a34a1-8e74-49e4-85b3-f65fcfdbb1b7	98513440-1173-48c4-bc5f-feb4ac0d1a1a	7add222f-ce87-4ac1-99a4-166daa5fbadb	2026-06-13 17:58:55.502698
b900175a-ab56-4494-b920-4856aa46ed54	a9220074-5cef-4591-b6ad-0833bc7ac532	5add5056-4b06-4645-9979-fe8a0fe2a5e5	2026-06-10 16:18:15.540677
22b55ca7-216a-4782-bb88-98ae69b054db	98513440-1173-48c4-bc5f-feb4ac0d1a1a	7884df35-d454-43d5-b897-ecce4ad440b7	2026-06-13 17:58:55.502698
0bb0e084-a6b0-4cec-8954-89cf0d2ff161	98513440-1173-48c4-bc5f-feb4ac0d1a1a	8c259344-c651-4174-baf3-79ee6ff38726	2026-06-13 17:58:55.502698
264798ea-25d4-492d-9582-7b238af2fc45	98513440-1173-48c4-bc5f-feb4ac0d1a1a	27db436d-3dcb-4b7b-9f93-c6d8f0054569	2026-06-13 17:58:55.502698
bd1a2135-f445-4438-b6ce-f6c74993cf01	98513440-1173-48c4-bc5f-feb4ac0d1a1a	55e19f7c-4b18-49a6-acf2-25c5e3f4a6e3	2026-06-13 17:58:55.502698
151cf4bf-d71e-465e-ae64-a50f1cb7ba1b	a9220074-5cef-4591-b6ad-0833bc7ac532	a9779898-778c-43f3-8e12-819dfa0cad2a	2026-06-11 20:32:19.562202
84860d29-57f8-440c-831d-66c586163f35	98513440-1173-48c4-bc5f-feb4ac0d1a1a	e4e5b95a-1fe1-4365-88a9-6acbdbe0014a	2026-06-13 17:58:55.502698
a1ee9a7d-2529-487f-b628-55acb2436747	a9220074-5cef-4591-b6ad-0833bc7ac532	e79f41ca-25c1-4e7b-87ec-dda873f3144a	2026-06-12 19:20:10.75776
18ed9c20-6c3c-47cd-b346-1f262d0d10ea	a9220074-5cef-4591-b6ad-0833bc7ac532	d3bac6e2-24a0-4afe-acb0-b39797ceb38f	2026-06-12 19:20:21.631361
b4e36dc2-2d72-4228-84e8-7d728b54efd2	a9220074-5cef-4591-b6ad-0833bc7ac532	2913d4da-96ad-43cf-8fbb-a6acd06ee956	2026-06-12 19:20:33.455364
a228b567-433c-457e-9e46-25c9413282ec	a9220074-5cef-4591-b6ad-0833bc7ac532	a655c55d-7beb-42bd-bd06-d0c62262d4ad	2026-06-12 19:20:40.362664
f1e87f46-cb33-43fc-ba54-0caa2ad1636e	98513440-1173-48c4-bc5f-feb4ac0d1a1a	a159fdec-08e3-4641-b8ce-161082cee933	2026-06-13 17:58:55.502698
ac806de7-2e10-4df7-ac6a-ee22cd881b2c	e836a5a4-dddc-4c8b-a9ed-5eb1f6f0b3b6	e5b4500b-a6c8-41b4-9363-637ee8b28b59	2026-06-13 17:58:55.502698
a1cd097b-3fbd-4eef-9bb3-c8ced4a234f7	15c78fa4-181e-4949-9c87-b93d6cbff62e	dc759ac0-1f81-4d8c-83ab-8caeee4dbf71	2026-06-13 15:55:26.665914
d833b893-c0f8-4039-add9-423213fffc45	15c78fa4-181e-4949-9c87-b93d6cbff62e	0cee047b-c465-4964-a22e-c1a8f4e6bf85	2026-06-13 15:55:29.140777
ab35ef19-6478-4953-a013-f0c6c9d95422	15c78fa4-181e-4949-9c87-b93d6cbff62e	5add5056-4b06-4645-9979-fe8a0fe2a5e5	2026-06-13 15:55:45.201939
46a5b231-0b61-4e76-b399-b6a4fd6b5c31	e836a5a4-dddc-4c8b-a9ed-5eb1f6f0b3b6	4a7448a4-5bfd-4b20-b8d0-c2bfeea8ce7f	2026-06-13 17:58:55.502698
8719840a-1bad-47d4-938f-c41ac2b9a969	e836a5a4-dddc-4c8b-a9ed-5eb1f6f0b3b6	9301fa41-e4af-48ef-b935-49e4806bf378	2026-06-13 17:58:55.502698
1ff52385-0fbc-447c-8c46-314c47525d08	e836a5a4-dddc-4c8b-a9ed-5eb1f6f0b3b6	2bb5ea6f-9f28-4d1b-994c-9323df7070e0	2026-06-13 17:58:55.502698
bef03ab2-14b5-4179-9322-56d840b3aad5	e836a5a4-dddc-4c8b-a9ed-5eb1f6f0b3b6	e53634db-7e04-449e-9ef7-eabecf4306f1	2026-06-13 17:58:55.502698
f31358d3-6f7c-4657-9f55-a7bf0570a4df	e836a5a4-dddc-4c8b-a9ed-5eb1f6f0b3b6	5a8be876-0039-45db-affc-b76c239fd7a9	2026-06-13 17:58:55.502698
44552661-5ae0-4cff-a070-e6158354271a	e836a5a4-dddc-4c8b-a9ed-5eb1f6f0b3b6	1bd28939-88cf-4937-b3a6-64a3bc071a75	2026-06-13 17:58:55.502698
5d0bbddb-7f82-43da-979c-bf15358574ca	72eb5795-6e8f-401c-bb38-6935f94d50a5	7ef2f523-8ce5-46a4-9bac-7d39c2df82e5	2026-06-13 17:58:55.502698
65162757-5e91-4585-80de-250c2a50812b	72eb5795-6e8f-401c-bb38-6935f94d50a5	9013e681-3f1c-44f5-82c8-84e568ac3424	2026-06-13 17:58:55.502698
9af619a7-d97a-4466-8ad5-6848b34397ec	72eb5795-6e8f-401c-bb38-6935f94d50a5	6ead8a20-3783-4d00-a026-04e49e0270fd	2026-06-13 17:58:55.502698
d3d3412a-6fc4-4824-aeb5-972044455713	72eb5795-6e8f-401c-bb38-6935f94d50a5	2961254f-64cd-4f42-a7cd-118b9bcb2355	2026-06-13 17:58:55.502698
2e7ef7a3-e0d9-4a53-a0df-781d2277c620	72eb5795-6e8f-401c-bb38-6935f94d50a5	feba5885-7b1a-4baf-a37f-babbbb1c9bb8	2026-06-13 17:58:55.502698
ec493a01-ebd5-4ca6-8d8a-019d4ba78799	72eb5795-6e8f-401c-bb38-6935f94d50a5	11eb78a2-d137-4055-ae4d-af6956c087fc	2026-06-13 17:58:55.502698
301d2e93-363e-437a-8109-2a3d2ef749f9	72eb5795-6e8f-401c-bb38-6935f94d50a5	bab1f3f5-f0e0-4af1-83d6-fd7e6efae906	2026-06-13 17:58:55.502698
fa26a5cc-1364-4233-a777-87acef1b4435	3fe804ac-e4fa-45d6-a957-5eedb344cf34	20e10a8a-8b46-4ea5-9ff4-affc5f616753	2026-06-13 17:58:55.502698
84139512-17d6-44fd-bc5f-8238f9c2ae54	3fe804ac-e4fa-45d6-a957-5eedb344cf34	f21f6c9f-8c15-48a7-8c28-0aaa6f6f601c	2026-06-13 17:58:55.502698
935a64eb-4907-441e-8703-15439fd4ac97	3fe804ac-e4fa-45d6-a957-5eedb344cf34	4e38d0b7-e91d-4fc3-a1bf-d8d2fdddf59d	2026-06-13 17:58:55.502698
b5e49af5-7e1a-4839-943f-7479df870501	3fe804ac-e4fa-45d6-a957-5eedb344cf34	8b13d763-9ca9-4902-9ed4-60579b43609e	2026-06-13 17:58:55.502698
f3cd42c7-9ee8-478a-8796-7ea408dc9951	3fe804ac-e4fa-45d6-a957-5eedb344cf34	62db196a-41ac-4537-be12-9e27a8a3dc8d	2026-06-13 17:58:55.502698
a908afa9-f126-4de5-b440-d1b89d0e8223	3fe804ac-e4fa-45d6-a957-5eedb344cf34	55e19f7c-4b18-49a6-acf2-25c5e3f4a6e3	2026-06-13 17:58:55.502698
2322ad8c-c774-4a42-b7d8-29f777b8978d	3fe804ac-e4fa-45d6-a957-5eedb344cf34	8c259344-c651-4174-baf3-79ee6ff38726	2026-06-13 17:58:55.502698
7045a92f-dfb3-4dba-80ae-4bd2f3a24d64	d65bd0aa-ae34-438c-b739-9b8cac0debf7	b183715f-8b3b-4e95-9456-4eb0ab9dd942	2026-06-13 17:58:55.502698
85554c37-1a0e-469f-a1f7-118315a13f55	d65bd0aa-ae34-438c-b739-9b8cac0debf7	07e844e3-21a5-4831-9f08-6f9ad18bdeb9	2026-06-13 17:58:55.502698
d0b6fd8d-fabf-4746-84f5-27cc9bd65171	d65bd0aa-ae34-438c-b739-9b8cac0debf7	e78ee996-d80f-4e21-b223-ef8d6b5d7b01	2026-06-13 17:58:55.502698
e4d3db40-2b86-49a3-b6cd-f17cb8106ea7	d65bd0aa-ae34-438c-b739-9b8cac0debf7	5919e0cb-a628-4df0-a83a-39915fa4b25f	2026-06-13 17:58:55.502698
cb20f9f0-983a-4fc6-b21d-66828f059024	d65bd0aa-ae34-438c-b739-9b8cac0debf7	8b13d763-9ca9-4902-9ed4-60579b43609e	2026-06-13 17:58:55.502698
c2342dea-f242-4a12-9476-984be0cd461c	753e480b-b90f-4e3e-9eb2-43dc15f2ce53	c2aa29d9-cac6-4c13-83ca-7e6c9600119d	2026-06-13 17:58:55.502698
8706747b-0bd9-4767-a7a9-831d1b1cde7e	753e480b-b90f-4e3e-9eb2-43dc15f2ce53	0c40790b-4838-40f1-a600-60e3a23271ec	2026-06-13 17:58:55.502698
c51dad58-ebff-47d6-b428-bce2a5721197	753e480b-b90f-4e3e-9eb2-43dc15f2ce53	1761ed80-b3ea-4c66-af7f-717007460541	2026-06-13 17:58:55.502698
ffb98e14-7eb6-438c-9285-29884c1be2f7	753e480b-b90f-4e3e-9eb2-43dc15f2ce53	4bcc38a2-2682-4dec-9345-3af476d6c191	2026-06-13 17:58:55.502698
6e977c38-e284-4991-896a-5e879a2a5488	753e480b-b90f-4e3e-9eb2-43dc15f2ce53	afb75683-bfe5-45c8-85c6-1273479f699f	2026-06-13 17:58:55.502698
17f17232-b4f1-4b58-9b68-a6c0c37f2fd7	886997b8-f78b-4c96-a236-f96367cd627f	3928db20-4d18-4aca-85fd-fac586970a5a	2026-06-13 17:58:55.502698
06c8fa87-aba3-4fee-aa99-de3cc28c708d	886997b8-f78b-4c96-a236-f96367cd627f	9cd507be-1871-4a4c-a507-8e5609c97e36	2026-06-13 17:58:55.502698
503c002e-b5c1-494c-bb8c-ffcf4b4b5295	886997b8-f78b-4c96-a236-f96367cd627f	1761ed80-b3ea-4c66-af7f-717007460541	2026-06-13 17:58:55.502698
8f7e63cb-10d5-4aeb-b024-aaf40d804b70	886997b8-f78b-4c96-a236-f96367cd627f	4bcc38a2-2682-4dec-9345-3af476d6c191	2026-06-13 17:58:55.502698
a100835d-7f52-4ef8-8afe-9ebac4bca429	d7c42c6f-2272-42f8-bd70-e7266f387022	8c7a0263-f3bc-4eaa-a51a-e8fb4290ade2	2026-06-13 17:58:55.502698
1dd825f8-3cfa-414f-bd4f-c820b944ae7f	d7c42c6f-2272-42f8-bd70-e7266f387022	5911eb07-3abf-4a4c-965a-dd53bd2dd463	2026-06-13 17:58:55.502698
5f74d9a0-cb2a-4735-a141-76737e3aa1be	d7c42c6f-2272-42f8-bd70-e7266f387022	44f2fd04-2e96-4186-a10c-926f1e5d9828	2026-06-13 17:58:55.502698
6bd42e21-f8ac-4385-bf93-6c2e203faf8a	d7c42c6f-2272-42f8-bd70-e7266f387022	3881b5a5-e3ce-41f8-a5b7-c4e5cdb7cd03	2026-06-13 17:58:55.502698
b949af8f-dc44-48b3-83a5-7853a0f3d386	cc8c3c7f-702f-4cd2-ad2d-ad8659328dca	46a0030a-662c-4baf-a95a-dc28b6a5db09	2026-06-13 17:58:55.502698
135756b0-5121-4521-9954-0bcf2b165c2e	cc8c3c7f-702f-4cd2-ad2d-ad8659328dca	686ac41c-4c45-4121-b4e5-daa86ac2a4ba	2026-06-13 17:58:55.502698
6a7e67f1-fe6c-4ba5-9bed-18c99adee59d	cc8c3c7f-702f-4cd2-ad2d-ad8659328dca	f2b3b665-e490-4844-ac7e-a9b67c388a84	2026-06-13 17:58:55.502698
0daf9ebd-3885-48c8-ab5c-c489fbfb7423	6343cd38-881a-41fa-9ca4-d154a8fde81b	0285c0fe-d977-4a9f-8ff6-d38caef991b2	2026-06-13 17:58:55.502698
1266a18a-86de-4c15-bdda-c4a7dc7d53b2	6343cd38-881a-41fa-9ca4-d154a8fde81b	7490f38a-1d8a-4eb2-857d-f17aedba936d	2026-06-13 17:58:55.502698
7035b3c2-a841-4b36-88e2-b1039aaeb5ff	6343cd38-881a-41fa-9ca4-d154a8fde81b	20e10a8a-8b46-4ea5-9ff4-affc5f616753	2026-06-13 17:58:55.502698
34526cb9-0205-483d-afd9-cf0524e1f5aa	6343cd38-881a-41fa-9ca4-d154a8fde81b	4e38d0b7-e91d-4fc3-a1bf-d8d2fdddf59d	2026-06-13 17:58:55.502698
f6536547-10f7-40ac-b352-2f181faac07e	f07f617a-9830-4b62-8751-bb062f69a49a	db1ff15e-6cd1-4ba5-86ab-67951b1e8a07	2026-06-13 17:58:55.502698
5c64b596-2c56-498d-99a2-421f0e8c5b40	f07f617a-9830-4b62-8751-bb062f69a49a	1ed712f3-9710-4006-96f9-c08d2b201f93	2026-06-13 17:58:55.502698
6645a5d6-0fb9-407b-90cd-b30563592c89	f07f617a-9830-4b62-8751-bb062f69a49a	07e844e3-21a5-4831-9f08-6f9ad18bdeb9	2026-06-13 17:58:55.502698
c1782d18-3517-4a9b-9fb2-bf1707db0410	25640b49-b7ce-401e-9e44-38b5074375b2	c40a8a92-f264-4fb5-9de5-441e037fd913	2026-06-13 17:58:55.502698
cea3acf8-b770-4a4b-9724-021324dda20c	25640b49-b7ce-401e-9e44-38b5074375b2	afb75683-bfe5-45c8-85c6-1273479f699f	2026-06-13 17:58:55.502698
bf1be3f1-fd5a-4f3c-adc4-c9acd6837d9a	25640b49-b7ce-401e-9e44-38b5074375b2	ae34c72b-877b-41c6-a6b7-135196d66a4d	2026-06-13 17:58:55.502698
dfc5dec0-c745-4009-95da-1773085234a5	25640b49-b7ce-401e-9e44-38b5074375b2	44c5ff8d-89dd-4f6b-b1f1-98a9cf12e682	2026-06-13 17:58:55.502698
51b771c6-1845-478b-a450-b744ed75cc76	25640b49-b7ce-401e-9e44-38b5074375b2	7ef2f523-8ce5-46a4-9bac-7d39c2df82e5	2026-06-13 17:58:55.502698
d3dbf6aa-5664-49d7-9830-7547f089d61b	25640b49-b7ce-401e-9e44-38b5074375b2	6ead8a20-3783-4d00-a026-04e49e0270fd	2026-06-13 17:58:55.502698
4545d51c-1346-4a4d-8ec1-35d121c3f14d	25640b49-b7ce-401e-9e44-38b5074375b2	2961254f-64cd-4f42-a7cd-118b9bcb2355	2026-06-13 17:58:55.502698
9d9e50c4-dcee-4c82-b853-bc8d1e83ab49	25640b49-b7ce-401e-9e44-38b5074375b2	11eb78a2-d137-4055-ae4d-af6956c087fc	2026-06-13 17:58:55.502698
b6143ba5-37f7-41cf-854f-21b84d10dfee	25640b49-b7ce-401e-9e44-38b5074375b2	5919e0cb-a628-4df0-a83a-39915fa4b25f	2026-06-13 17:58:55.502698
10818bb9-f655-435c-b621-487a777a65f3	a9220074-5cef-4591-b6ad-0833bc7ac532	2961254f-64cd-4f42-a7cd-118b9bcb2355	2026-06-20 02:52:40.89339
233f4684-cecc-42da-9681-efe107f1abb2	99d53037-35b0-4dc6-8482-b86c4385bcda	e78ee996-d80f-4e21-b223-ef8d6b5d7b01	2026-06-20 03:37:29.765602
a8c351a1-6c60-46d9-b19b-a65d252e4b65	99d53037-35b0-4dc6-8482-b86c4385bcda	1bd28939-88cf-4937-b3a6-64a3bc071a75	2026-06-20 03:37:37.264952
dfe7a87f-bbee-4192-9b58-78cdd31d4b28	99d53037-35b0-4dc6-8482-b86c4385bcda	2bb5ea6f-9f28-4d1b-994c-9323df7070e0	2026-06-20 03:37:41.379944
665aee30-3679-4eda-a3fe-22c9063282ae	99d53037-35b0-4dc6-8482-b86c4385bcda	feba5885-7b1a-4baf-a37f-babbbb1c9bb8	2026-07-06 16:25:01.242871
5c32d5be-2f3b-4dab-9516-49b95536df2b	99d53037-35b0-4dc6-8482-b86c4385bcda	6ead8a20-3783-4d00-a026-04e49e0270fd	2026-07-06 16:25:12.063945
\.


--
-- Data for Name: product_wishlists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_wishlists (id, user_id, product_id, created_at) FROM stdin;
e1742d8e-796f-4177-9db4-9a683013dc25	99d53037-35b0-4dc6-8482-b86c4385bcda	e53634db-7e04-449e-9ef7-eabecf4306f1	2026-06-20 03:37:33.555745
82795ce0-a9a0-442b-9126-7bc20bb6864f	0b8676fd-ee36-40c3-b57e-8a7d0d5e3aa4	1a1481df-1e9b-47ae-9366-5b67913013d4	2026-06-10 13:37:24.948925
721a63fb-f6b7-42e8-a4b9-962329c84a70	a9220074-5cef-4591-b6ad-0833bc7ac532	5add5056-4b06-4645-9979-fe8a0fe2a5e5	2026-06-10 16:18:16.977991
f95ef1fa-e26f-49f0-9823-b9b1070757cd	99d53037-35b0-4dc6-8482-b86c4385bcda	2bb5ea6f-9f28-4d1b-994c-9323df7070e0	2026-06-20 03:37:41.021748
ad9f4845-9685-4357-b41d-b86c0b7b2a3a	99d53037-35b0-4dc6-8482-b86c4385bcda	feba5885-7b1a-4baf-a37f-babbbb1c9bb8	2026-07-06 16:25:02.314693
3795722b-8411-4ad7-8502-3d556bac7387	a9220074-5cef-4591-b6ad-0833bc7ac532	d3bac6e2-24a0-4afe-acb0-b39797ceb38f	2026-06-12 19:20:23.574038
c95f947d-54ae-4cbf-825b-c5e8f43695b3	a9220074-5cef-4591-b6ad-0833bc7ac532	a655c55d-7beb-42bd-bd06-d0c62262d4ad	2026-06-12 19:20:41.716641
59881e72-e68e-45fb-8435-27f6ee01294d	15c78fa4-181e-4949-9c87-b93d6cbff62e	dc759ac0-1f81-4d8c-83ab-8caeee4dbf71	2026-06-13 15:55:27.349279
b452d450-507d-40e7-af2f-60901bd58ac8	15c78fa4-181e-4949-9c87-b93d6cbff62e	0cee047b-c465-4964-a22e-c1a8f4e6bf85	2026-06-13 15:55:29.804349
ac40180b-b09a-4a72-9052-815f7d59a04c	15c78fa4-181e-4949-9c87-b93d6cbff62e	5add5056-4b06-4645-9979-fe8a0fe2a5e5	2026-06-13 15:55:46.037102
680a5a12-e4ff-499c-a409-68d50fb2cf11	98513440-1173-48c4-bc5f-feb4ac0d1a1a	6ab4f64a-f12e-4a4b-a454-792c77503d01	2026-06-13 17:58:55.502698
9f0185ba-6232-4955-99f7-89234986a940	98513440-1173-48c4-bc5f-feb4ac0d1a1a	27db436d-3dcb-4b7b-9f93-c6d8f0054569	2026-06-13 17:58:55.502698
3bc06afc-2815-493d-aa46-75a3ad1f5777	98513440-1173-48c4-bc5f-feb4ac0d1a1a	e4e5b95a-1fe1-4365-88a9-6acbdbe0014a	2026-06-13 17:58:55.502698
2c1ae3ca-5de3-487b-837f-7ea425a181cf	98513440-1173-48c4-bc5f-feb4ac0d1a1a	7884df35-d454-43d5-b897-ecce4ad440b7	2026-06-13 17:58:55.502698
56d825cc-850c-4232-bb2a-b121c8b9e16f	e836a5a4-dddc-4c8b-a9ed-5eb1f6f0b3b6	e5b4500b-a6c8-41b4-9363-637ee8b28b59	2026-06-13 17:58:55.502698
a87028e4-ed85-4c28-9224-d3913a1c5f12	e836a5a4-dddc-4c8b-a9ed-5eb1f6f0b3b6	9301fa41-e4af-48ef-b935-49e4806bf378	2026-06-13 17:58:55.502698
eefc5268-d8cb-4d62-a8ea-fbf30d8c9438	e836a5a4-dddc-4c8b-a9ed-5eb1f6f0b3b6	2bb5ea6f-9f28-4d1b-994c-9323df7070e0	2026-06-13 17:58:55.502698
ac533d49-93b5-4840-9577-8de7c47636ee	e836a5a4-dddc-4c8b-a9ed-5eb1f6f0b3b6	5a8be876-0039-45db-affc-b76c239fd7a9	2026-06-13 17:58:55.502698
df433714-17fd-4b54-bae2-e4474bb7879b	72eb5795-6e8f-401c-bb38-6935f94d50a5	7ef2f523-8ce5-46a4-9bac-7d39c2df82e5	2026-06-13 17:58:55.502698
7e54e30c-5a4f-48ec-913b-f9f500f9811f	72eb5795-6e8f-401c-bb38-6935f94d50a5	6ead8a20-3783-4d00-a026-04e49e0270fd	2026-06-13 17:58:55.502698
432dbcaf-72c3-4257-8d27-60ab7979537d	72eb5795-6e8f-401c-bb38-6935f94d50a5	2961254f-64cd-4f42-a7cd-118b9bcb2355	2026-06-13 17:58:55.502698
d66b9195-4c08-4055-be72-8764433a0192	72eb5795-6e8f-401c-bb38-6935f94d50a5	11eb78a2-d137-4055-ae4d-af6956c087fc	2026-06-13 17:58:55.502698
8e8b4047-b81c-4314-b63c-89982662582b	3fe804ac-e4fa-45d6-a957-5eedb344cf34	20e10a8a-8b46-4ea5-9ff4-affc5f616753	2026-06-13 17:58:55.502698
2f8662f6-6ec1-4577-a1fc-bd2084870333	3fe804ac-e4fa-45d6-a957-5eedb344cf34	f21f6c9f-8c15-48a7-8c28-0aaa6f6f601c	2026-06-13 17:58:55.502698
14397327-6019-4ad0-83f1-3318e3b869f7	3fe804ac-e4fa-45d6-a957-5eedb344cf34	4e38d0b7-e91d-4fc3-a1bf-d8d2fdddf59d	2026-06-13 17:58:55.502698
a3ac694f-ed05-4c6c-82ac-d352e984ce2e	3fe804ac-e4fa-45d6-a957-5eedb344cf34	55e19f7c-4b18-49a6-acf2-25c5e3f4a6e3	2026-06-13 17:58:55.502698
3ca85e56-0ce9-45da-9bef-05b6e1c327c5	d65bd0aa-ae34-438c-b739-9b8cac0debf7	07e844e3-21a5-4831-9f08-6f9ad18bdeb9	2026-06-13 17:58:55.502698
1d310571-b444-4a41-b1a4-36f120f08bcf	d65bd0aa-ae34-438c-b739-9b8cac0debf7	e78ee996-d80f-4e21-b223-ef8d6b5d7b01	2026-06-13 17:58:55.502698
4455dac7-e4e4-42df-938e-380c347415c4	753e480b-b90f-4e3e-9eb2-43dc15f2ce53	c2aa29d9-cac6-4c13-83ca-7e6c9600119d	2026-06-13 17:58:55.502698
7853574e-d405-4fd0-9d61-58cb6eafba0d	753e480b-b90f-4e3e-9eb2-43dc15f2ce53	1761ed80-b3ea-4c66-af7f-717007460541	2026-06-13 17:58:55.502698
d3e2eb52-b390-4ebb-be02-7fa51a98abe4	886997b8-f78b-4c96-a236-f96367cd627f	9cd507be-1871-4a4c-a507-8e5609c97e36	2026-06-13 17:58:55.502698
680e94d5-3db4-4fe4-b907-acf0e7ab12f3	886997b8-f78b-4c96-a236-f96367cd627f	3928db20-4d18-4aca-85fd-fac586970a5a	2026-06-13 17:58:55.502698
1411ab0c-9ce8-4c46-a981-d2fe1f235c53	d7c42c6f-2272-42f8-bd70-e7266f387022	8c7a0263-f3bc-4eaa-a51a-e8fb4290ade2	2026-06-13 17:58:55.502698
57cca767-6e2f-425d-900e-bcce7e73d5e4	d7c42c6f-2272-42f8-bd70-e7266f387022	3881b5a5-e3ce-41f8-a5b7-c4e5cdb7cd03	2026-06-13 17:58:55.502698
604a3799-fe69-4e49-a00e-0c23f023c932	cc8c3c7f-702f-4cd2-ad2d-ad8659328dca	46a0030a-662c-4baf-a95a-dc28b6a5db09	2026-06-13 17:58:55.502698
fb73b87b-d5ce-4586-888e-bf411adc9203	cc8c3c7f-702f-4cd2-ad2d-ad8659328dca	f2b3b665-e490-4844-ac7e-a9b67c388a84	2026-06-13 17:58:55.502698
829361a2-f8b9-4741-bac6-3229c4ab0ec7	6343cd38-881a-41fa-9ca4-d154a8fde81b	0285c0fe-d977-4a9f-8ff6-d38caef991b2	2026-06-13 17:58:55.502698
4ad0196f-10ca-4753-ae9b-0b848deab0da	6343cd38-881a-41fa-9ca4-d154a8fde81b	7490f38a-1d8a-4eb2-857d-f17aedba936d	2026-06-13 17:58:55.502698
32285450-0f50-44e2-b5a1-7970cb790549	f07f617a-9830-4b62-8751-bb062f69a49a	db1ff15e-6cd1-4ba5-86ab-67951b1e8a07	2026-06-13 17:58:55.502698
55a740a9-4571-4f33-9f83-98da7c42368c	f07f617a-9830-4b62-8751-bb062f69a49a	1ed712f3-9710-4006-96f9-c08d2b201f93	2026-06-13 17:58:55.502698
3903ed84-6fe7-431f-a954-5d29bd08ad98	25640b49-b7ce-401e-9e44-38b5074375b2	7ef2f523-8ce5-46a4-9bac-7d39c2df82e5	2026-06-13 17:58:55.502698
ff9a505c-88a0-4c2b-b913-f2e101dd83de	25640b49-b7ce-401e-9e44-38b5074375b2	2961254f-64cd-4f42-a7cd-118b9bcb2355	2026-06-13 17:58:55.502698
06f39f33-1dae-4f0e-b4ca-f5dba1508938	25640b49-b7ce-401e-9e44-38b5074375b2	5919e0cb-a628-4df0-a83a-39915fa4b25f	2026-06-13 17:58:55.502698
8396c5b0-fee8-4bb6-a6aa-d17d777bc862	25640b49-b7ce-401e-9e44-38b5074375b2	c40a8a92-f264-4fb5-9de5-441e037fd913	2026-06-13 17:58:55.502698
c4561815-7d06-4111-a1d2-efded0bc623e	99d53037-35b0-4dc6-8482-b86c4385bcda	1bd28939-88cf-4937-b3a6-64a3bc071a75	2026-06-20 03:37:37.615125
eb570568-14e3-4cc3-93b4-e6a3fad0c1a1	99d53037-35b0-4dc6-8482-b86c4385bcda	9301fa41-e4af-48ef-b935-49e4806bf378	2026-06-20 03:37:46.811077
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, image_url, category, material, style_theme, dominant_color, room_category, description, price, stock, status, created_at, updated_at, material_variant) FROM stdin;
9301fa41-e4af-48ef-b935-49e4806bf378	Lemari Pakaian Modern HPL Solid Putih	https://i.pinimg.com/1200x/1b/c7/8f/1bc78f7db48baee605a313d2c9e64890.jpg	Lemari	HPL	Modern	Putih	Kamar Tidur	Produk bergaya Modern dengan material HPL Solid dan warna Putih, cocok untuk kamar tidur modern.	7100000.00	8	active	2026-06-13 17:58:55.502698	2026-06-13 19:31:58.518021	Solid
e78ee996-d80f-4e21-b223-ef8d6b5d7b01	Lemari Display Ruang Tamu HPL Kaca Glossy Hitam	https://i.pinimg.com/736x/a4/ea/c2/a4eac2481d676cb226f9ea4c2ed273c6.jpg	Lemari	HPL + Kaca	Modern	Hitam	Ruang Tamu	Produk bergaya Modern dengan material HPL + Kaca Glossy dan warna Hitam, cocok untuk display ruang tamu.	6300000.00	6	active	2026-06-13 17:58:55.502698	2026-06-13 19:35:38.991122	Glossy
2913d4da-96ad-43cf-8fbb-a6acd06ee956	Nakas Minimalis 3 Laci	https://i.pinimg.com/736x/70/28/0c/70280c733f1d13770225a4f692adb2bb.jpg	Nakas	Kayu	Minimalis	Putih	Kamar Tidur	Nakas 3 Laci modern minimalis dengan 2 warna	300000.00	11	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Tidak Ada
d3bac6e2-24a0-4afe-acb0-b39797ceb38f	Nakas Putih	https://i.pinimg.com/1200x/fd/11/e7/fd11e70955f33b3633d4c12c757eedd5.jpg	Nakas	HPL	Modern	Putih	Kamar Tidur	Nakas putih elegan minimalis	400000.00	10	inactive	2026-06-10 19:17:13.280227	2026-06-13 17:58:55.502698	Solid
a655c55d-7beb-42bd-bd06-d0c62262d4ad	Nakas Minimalis 2 Laci	https://i.pinimg.com/1200x/f5/b7/a1/f5b7a16bc8a6279acef24cb28cd33ce1.jpg	Nakas	HPL	Minimalis	Putih	Kamar Tidur	Nakas Kayu Putih 2 laci minimalis	250000.00	18	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Woodgrain
c2970d6c-23c2-4eba-9d15-4995a3a86f23	Lemari Dapur Modular Walnut	https://i.pinimg.com/1200x/cb/93/df/cb93dfce51a6d17dc6e9fc1dc5cb39f9.jpg	Lemari	HPL	Modern	Cokelat Tua	Dapur	Lemari dapur modular walnut untuk penyimpanan perlengkapan dapur.	9100000.00	5	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Woodgrain
1a1481df-1e9b-47ae-9366-5b67913013d4	Lemari Pakaian Oak	https://i.pinimg.com/1200x/d7/8e/5a/d78e5a5a2f640fe03a4c272cc130d0b2.jpg	Lemari	HPL	Japandi	Natural Oak	Kamar Tidur	Lemari pakaian kayu oak dengan desain yang ringan.	7800000.00	8	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Woodgrain
5add5056-4b06-4645-9979-fe8a0fe2a5e5	Meja Makan Marmer Putih	https://i.pinimg.com/1200x/53/94/21/539421f169c2049316eb5e6c4cf3103b.jpg	Meja	Kayu	Minimalis	Putih	Ruang Makan	Meja makan marmer putih dengan kaki Kayu untuk interior elegan.	10500000.00	5	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Marble
0cee047b-c465-4964-a22e-c1a8f4e6bf85	Kursi Kayu Minimalis V2	https://i.pinimg.com/1200x/d8/98/7f/d8987fad0274bc39791f4fb146eaba6e.jpg	Meja	Kayu + Linen	Modern	Coklat Muda	Ruang Makan	Versi Upgrade dari Kursi Kayu Meja makan marmer putih	800000.00	21	inactive	2026-06-10 14:22:37.607468	2026-06-13 17:58:55.502698	Tidak Ada
a9779898-778c-43f3-8e12-819dfa0cad2a	Meja Tamu Susun Bundar	https://i.pinimg.com/1200x/ad/34/3a/ad343a5e97530e3e58c93f029ca45bff.jpg	Meja	Kayu + Logam	Modern	Coklat Tua	Ruang Tamu	Meja tamu susun berbahan Kayu dengan rangka metal hitam.	2000000.00	10	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Tidak Ada
dc759ac0-1f81-4d8c-83ab-8caeee4dbf71	Kursi Kayu Minimalis	https://i.pinimg.com/1200x/67/18/c8/6718c8e27ca468bce37e228c2f205415.jpg	Kursi	Kayu + Linen	Modern	Coklat	Ruang Makan	Kursi Kayu minimalis dan cocok untuk Kursi Meja Makan Marmer Putih	500000.00	9	inactive	2026-06-10 00:52:58.878767	2026-06-13 20:42:54.075744	Tidak Ada
3826994f-d4f7-4a9d-a013-e840169fbc69	Lemari Display Kaca Hitam	https://i.pinimg.com/1200x/66/c2/b5/66c2b5e6c4d4e894a87451726c3f2eee.jpg	Lemari	Logam	Modern	Hitam	Ruang Tamu	Lemari display kaca hitam untuk koleksi dekorasi ruang tamu.	6200000.00	6	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Tidak Ada
63690689-4252-479f-813d-948394d9f500	Lemari Sliding Minimalis Putih	https://i.pinimg.com/736x/01/6c/ad/016cad9ba3fc7f6e5156db901a970a09.jpg	Lemari	HPL	Minimalis	Putih	Kamar Tidur	Lemari sliding putih dengan penyimpanan besar untuk kamar modern.	8400000.00	7	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Tidak Ada
50985a09-dfc3-4aec-a93e-ec79c515d4e6	Meja Kayu Hitam	https://i.pinimg.com/736x/c9/4d/65/c94d65698dcf883ee82971dca84340d2.jpg	Meja	Kayu + Logam	Modern	Hitam	Ruang Tamu	Meja kopi industrial dengan rangka metal hitam dan top kayu.	2500000.00	14	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Tidak Ada
4e6af8c0-20fe-49ed-b1c5-32e67b948144	Nakas Minimalis 2 Laci Abu	https://i.pinimg.com/1200x/07/22/e4/0722e4747baac0c78e31d82111355789.jpg	Nakas	HPL	Minimalis	Abu-abu	Kamar Tidur	Nakas abu-abu 2 Laci dengan desain modern Minimalis	280000.00	7	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Solid
9db537e2-1a25-425c-8092-02a510602097	Meja Kerja Minimalis Oak	https://i.pinimg.com/1200x/1f/09/12/1f091214852482cc80d0e0293f4dd672.jpg	Meja	HPL	Minimalis	Oak	Ruang Makan	Meja kerja kayu oak dengan bentuk ringkas dan penyimpanan sederhana.	3200000.00	15	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Woodgrain
97f4b662-56b8-4d86-a215-bf99d80c4e2e	Kursi Mini Bar Minimalis	https://i.pinimg.com/736x/22/55/c2/2255c24d7097b4c273edac4ca1192357.jpg	Minibar	Kayu + Linen	Minimalis	Putih	Mini Bar	Kursi Mini bar elegant	2600000.00	\N	inactive	2026-06-10 15:24:09.878671	2026-06-13 17:58:55.502698	Tidak Ada
9f842a6e-21e7-4e5f-9865-2981dbfdad13	Kitchen Set Modern Putih	https://i.pinimg.com/736x/6d/df/33/6ddf33cf5cb4b6aa904308b2f048b70d.jpg	Kitchen Set	HPL	Modern	Putih	Dapur	Kitchen set putih dengan finishing HPL yang mudah dibersihkan.	51800000.00	\N	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Tidak Ada
f8261c05-b61f-4975-82fa-a27f65d02889	Kitchen Set Industrial Abu-Abu	https://i.pinimg.com/1200x/97/94/2d/97942db613c82a44bdf29ab1a2b1da66.jpg	Kitchen Set	HPL	Modern	Abu-abu	Dapur	Kitchen set bernuansa beton dengan aksen industrial untuk dapur modern.	13250000.00	\N	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Tidak Ada
e79f41ca-25c1-4e7b-87ec-dda873f3144a	Kitchen Set Minimalis Oak	https://i.pinimg.com/736x/51/22/a4/5122a45aebe1a539fa25c5bdc854b0ab.jpg	Kitchen Set	Kayu	Minimalis	Oak	Dapur	Kitchen set kayu oak dengan penyimpanan modular untuk dapur minimalis.	12500000.00	\N	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Tidak Ada
9c2722e5-ad24-4adf-8eff-99de96bf392e	Kitchen Set Japandi Walnut	https://i.pinimg.com/736x/49/3d/64/493d647c347b533247864d8bf6ce825d.jpg	Kitchen Set	Kayu	Japandi	Walnut	Dapur	Kitchen set walnut dengan garis bersih dan nuansa Japandi.	14500000.00	\N	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Tidak Ada
17de4ddb-0a72-4b3e-a519-2bc05590e0b5	Tempat Tidur Minimalis Putih	https://i.pinimg.com/736x/f6/4c/c8/f64cc8e8641875b5c7cdf23a52cd94ea.jpg	Bedset	HPL	Minimalis	Putih	Kamar Tidur	Tempat tidur minimalis dengan panel putih dan laci penyimpanan.	5900000.00	\N	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Tidak Ada
dfe998c7-6ad3-4848-a2e1-bdef13a71f6b	Mini Bar Modern Minimalis	https://i.pinimg.com/736x/2e/75/1e/2e751e884e94fb9cca52cda699228b50.jpg	Minibar	Kayu	Modern	Hitam	Dapur	Mini bar dengan kombinasi Kayu hitam dan Marmer putih untuk konsep modern minimalis	7600000.00	\N	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Marble
d72a01d6-b079-418c-b592-ed7a8f02f225	Kursi Mini Bar Modern Putih	https://i.pinimg.com/736x/cb/9e/3d/cb9e3d3c2c22869b2adb431d2ef86c46.jpg	Minibar	Kayu + Linen	Modern	Putih	Dapur	Kursi Mini bar modern dengan warna putih.	2500000.00	\N	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Tidak Ada
780c0d65-abed-4832-82d8-a163f7ef7f85	Mini Bar Marmer Putih Minimalis	https://i.pinimg.com/1200x/e8/22/46/e822461c8deb809d37f693911410ba6c.jpg	Minibar	Kayu	Modern	Putih	Ruang Makan	Mini bar Modern minimalis dengan marmer putih untuk ruang tamu.	50700000.00	\N	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Marble
65e5f39b-3e7e-4097-91b0-24dcd350406a	Kursi Mini Bar Hidrolik	https://i.pinimg.com/1200x/c5/8f/11/c58f11c7bbacc0ceedbb0c5f99145674.jpg	Minibar	Logam	Modern	Hitam	Ruang Tamu	Kursi minibar hidrolik hitam dengan kaki besi untuk minibar.	4500000.00	\N	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Tidak Ada
bcc904c8-c7c9-492d-9225-ba62aaf100fd	Rak TV Minimalis Walnut	https://i.pinimg.com/1200x/eb/fd/78/ebfd7858e03ecc9dfc652044d9a90d08.jpg	Living Set	Kayu	Minimalis	Cokelat Tua	Ruang Tamu	Rak TV rendah dengan finishing walnut dan penyimpanan tertutup.	4200000.00	\N	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Tidak Ada
aa2b9b86-9fb2-4946-8ede-d67138c593fb	Mini Bar Kayu Oak	https://i.pinimg.com/1200x/47/9a/32/479a3262d3bc4985349af9ec2bf576c4.jpg	Minibar	Kayu	Minimalis	Coklat	Dapur	Mini bar compact berbahan kayu oak untuk area dapur	7200000.00	\N	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Woodgrain
6cc14b2e-0e42-4e02-9d66-92a8494e2e46	Tempat Tidur Scandinavian Pine	https://i.pinimg.com/736x/d9/6e/22/d96e221e3b7da5b1edf33879bc1c152c.jpg	Bedset	Kayu	Japandi	Cokelat Muda	Kamar Tidur	Rangka tempat tidur kayu pinus dengan tampilan hangat dan sederhana.	6500000.00	\N	inactive	2026-06-10 00:52:58.878767	2026-06-13 17:58:55.502698	Tidak Ada
c2aa29d9-cac6-4c13-83ca-7e6c9600119d	Kitchen Set Modern HPL Solid Putih	https://placehold.co/600x400?text=Kitchen+Set+Modern+HPL+Solid+Putih	Kitchen Set	HPL	Modern	Putih	Dapur	Produk bergaya Modern dengan material HPL Solid dan warna Putih, cocok untuk melengkapi interior Dapur yang bersih dan fungsional.	11800000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Solid
3928db20-4d18-4aca-85fd-fac586970a5a	Kitchen Set Japandi HPL Woodgrain Beige	https://placehold.co/600x400?text=Kitchen+Set+Japandi+HPL+Woodgrain+Beige	Kitchen Set	HPL	Japandi	Beige	Dapur	Produk bergaya Japandi dengan material HPL Woodgrain dan warna Beige, cocok untuk melengkapi interior Dapur yang hangat dan natural.	12600000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Woodgrain
c40a8a92-f264-4fb5-9de5-441e037fd913	Kitchen Set Minimalis HPL Marble Putih	https://placehold.co/600x400?text=Kitchen+Set+Minimalis+HPL+Marble+Putih	Kitchen Set	HPL	Minimalis	Putih	Dapur	Produk bergaya Minimalis dengan material HPL Marble dan warna Putih, cocok untuk dapur yang rapi dan terang.	13200000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Marble
0c40790b-4838-40f1-a600-60e3a23271ec	Kitchen Set Modern HPL Kaca Glossy Hitam	https://placehold.co/600x400?text=Kitchen+Set+Modern+HPL+Kaca+Glossy+Hitam	Kitchen Set	HPL + Kaca	Modern	Hitam	Dapur	Produk bergaya Modern dengan material HPL + Kaca Glossy dan warna Hitam, cocok untuk dapur modern yang tegas.	14800000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Glossy
9cd507be-1871-4a4c-a507-8e5609c97e36	Kitchen Set Japandi HPL Woodgrain Natural	https://placehold.co/600x400?text=Kitchen+Set+Japandi+HPL+Woodgrain+Natural	Kitchen Set	HPL	Japandi	Natural	Dapur	Produk bergaya Japandi dengan material HPL Woodgrain dan warna Natural, cocok untuk dapur bernuansa kayu.	12900000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Woodgrain
afb75683-bfe5-45c8-85c6-1273479f699f	Kitchen Set Minimalis HPL Solid Abu	https://placehold.co/600x400?text=Kitchen+Set+Minimalis+HPL+Solid+Abu	Kitchen Set	HPL	Minimalis	Abu-abu	Dapur	Produk bergaya Minimalis dengan material HPL Solid dan warna Abu-abu, cocok untuk dapur modern yang netral.	11900000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Solid
20e10a8a-8b46-4ea5-9ff4-affc5f616753	Living Set Japandi Linen Beige	https://placehold.co/600x400?text=Living+Set+Japandi+Linen+Beige	Living Set	Linen	Japandi	Beige	Ruang Tamu	Produk bergaya Japandi dengan material Linen dan warna Beige, cocok untuk ruang tamu yang hangat dan nyaman.	9800000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Tidak Ada
b183715f-8b3b-4e95-9456-4eb0ab9dd942	Living Set Modern Kayu Linen Abu	https://placehold.co/600x400?text=Living+Set+Modern+Kayu+Linen+Abu	Living Set	Kayu + Linen	Modern	Abu-abu	Ruang Tamu	Produk bergaya Modern dengan material Kayu + Linen dan warna Abu-abu, cocok untuk ruang tamu keluarga.	10400000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Tidak Ada
ae34c72b-877b-41c6-a6b7-135196d66a4d	Living Set Minimalis HPL Solid Putih	https://placehold.co/600x400?text=Living+Set+Minimalis+HPL+Solid+Putih	Living Set	HPL	Minimalis	Putih	Ruang Tamu	Produk bergaya Minimalis dengan material HPL Solid dan warna Putih, cocok untuk ruang tamu yang bersih.	8600000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Solid
07e844e3-21a5-4831-9f08-6f9ad18bdeb9	Living Set Modern Logam Linen Hitam	https://placehold.co/600x400?text=Living+Set+Modern+Logam+Linen+Hitam	Living Set	Logam + Linen	Modern	Hitam	Ruang Tamu	Produk bergaya Modern dengan material Logam + Linen dan warna Hitam, cocok untuk ruang tamu urban.	11200000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Tidak Ada
f21f6c9f-8c15-48a7-8c28-0aaa6f6f601c	Living Set Japandi Kayu Linen Natural	https://placehold.co/600x400?text=Living+Set+Japandi+Kayu+Linen+Natural	Living Set	Kayu + Linen	Japandi	Natural	Ruang Tamu	Produk bergaya Japandi dengan material Kayu + Linen dan warna Natural, cocok untuk ruang tamu natural.	10900000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Tidak Ada
44c5ff8d-89dd-4f6b-b1f1-98a9cf12e682	Living Set Minimalis HPL Kaca Glossy Coklat	https://placehold.co/600x400?text=Living+Set+Minimalis+HPL+Kaca+Glossy+Coklat	Living Set	HPL + Kaca	Minimalis	Coklat	Ruang Tamu	Produk bergaya Minimalis dengan material HPL + Kaca Glossy dan warna Coklat, cocok untuk ruang tamu elegan.	10100000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Glossy
6ab4f64a-f12e-4a4b-a454-792c77503d01	Bedset Japandi HPL Woodgrain Beige	https://placehold.co/600x400?text=Bedset+Japandi+HPL+Woodgrain+Beige	Bedset	HPL	Japandi	Beige	Kamar Tidur	Produk bergaya Japandi dengan material HPL Woodgrain dan warna Beige, cocok untuk kamar tidur yang hangat.	7600000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Woodgrain
e5b4500b-a6c8-41b4-9363-637ee8b28b59	Bedset Modern HPL Solid Putih	https://placehold.co/600x400?text=Bedset+Modern+HPL+Solid+Putih	Bedset	HPL	Modern	Putih	Kamar Tidur	Produk bergaya Modern dengan material HPL Solid dan warna Putih, cocok untuk kamar tidur modern.	7900000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Solid
7ef2f523-8ce5-46a4-9bac-7d39c2df82e5	Bedset Minimalis HPL Marble Abu	https://placehold.co/600x400?text=Bedset+Minimalis+HPL+Marble+Abu	Bedset	HPL	Minimalis	Abu-abu	Kamar Tidur	Produk bergaya Minimalis dengan material HPL Marble dan warna Abu-abu, cocok untuk kamar tidur netral.	7350000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Marble
7add222f-ce87-4ac1-99a4-166daa5fbadb	Bedset Japandi Kayu Linen Natural	https://placehold.co/600x400?text=Bedset+Japandi+Kayu+Linen+Natural	Bedset	Kayu + Linen	Japandi	Natural	Kamar Tidur	Produk bergaya Japandi dengan material Kayu + Linen dan warna Natural, cocok untuk kamar tidur natural.	8200000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Tidak Ada
4a7448a4-5bfd-4b20-b8d0-c2bfeea8ce7f	Bedset Modern HPL Kaca Glossy Hitam	https://placehold.co/600x400?text=Bedset+Modern+HPL+Kaca+Glossy+Hitam	Bedset	HPL + Kaca	Modern	Hitam	Kamar Tidur	Produk bergaya Modern dengan material HPL + Kaca Glossy dan warna Hitam, cocok untuk kamar tidur tegas.	8700000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Glossy
9013e681-3f1c-44f5-82c8-84e568ac3424	Bedset Minimalis Kayu Beige	https://placehold.co/600x400?text=Bedset+Minimalis+Kayu+Beige	Bedset	Kayu	Minimalis	Beige	Kamar Tidur	Produk bergaya Minimalis dengan material Kayu dan warna Beige, cocok untuk kamar tidur sederhana.	6900000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Tidak Ada
686ac41c-4c45-4121-b4e5-daa86ac2a4ba	Minibar Japandi Kayu Logam Coklat	https://placehold.co/600x400?text=Minibar+Japandi+Kayu+Logam+Coklat	Minibar	Kayu + Logam	Japandi	Coklat	Mini Bar	Produk bergaya Japandi dengan material Kayu + Logam dan warna Coklat, cocok untuk mini bar hangat.	9100000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 17:58:55.502698	Tidak Ada
6ead8a20-3783-4d00-a026-04e49e0270fd	Lemari Pakaian Minimalis HPL Marble Abu	https://i.pinimg.com/736x/f9/e7/86/f9e786c952b306d9aae85d5198c3e614.jpg	Lemari	HPL	Minimalis	Abu-abu	Kamar Tidur	Produk bergaya Minimalis dengan material HPL Marble dan warna Abu-abu, cocok untuk kamar tidur netral.	6900000.00	7	active	2026-06-13 17:58:55.502698	2026-06-13 19:33:06.393268	Marble
7884df35-d454-43d5-b897-ecce4ad440b7	Lemari Pakaian Japandi HPL Woodgrain Beige	https://i.pinimg.com/1200x/62/13/fd/6213fd98771694dec0c13e43fd8c1537.jpg	Lemari	HPL	Japandi	Beige	Kamar Tidur	Produk bergaya Japandi dengan material HPL Woodgrain dan warna Beige, cocok untuk kamar tidur hangat.	6800000.00	9	active	2026-06-13 17:58:55.502698	2026-06-13 19:36:58.985519	Woodgrain
62db196a-41ac-4537-be12-9e27a8a3dc8d	Lemari TV Minimalis HPL Solid Putih	https://i.pinimg.com/736x/7c/ac/8f/7cac8f6f851911e4210a4759da6e6786.jpg	Lemari	HPL	Minimalis	Putih	Ruang Tamu	Produk bergaya Minimalis dengan material HPL Solid dan warna Putih, cocok untuk area TV ruang tamu.	5200000.00	7	active	2026-06-13 17:58:55.502698	2026-06-13 19:38:00.299221	Solid
7490f38a-1d8a-4eb2-857d-f17aedba936d	Kursi Makan Japandi Kayu Linen Beige	https://i.pinimg.com/736x/7a/80/2c/7a802c3fedda437e1eb569af28f83585.jpg	Kursi	Kayu + Linen	Japandi	Beige	Ruang Makan	Produk bergaya Japandi dengan material Kayu + Linen dan warna Beige, cocok untuk ruang makan hangat.	1250000.00	18	active	2026-06-13 17:58:55.502698	2026-06-13 19:40:21.114161	Tidak Ada
1ed712f3-9710-4006-96f9-c08d2b201f93	Kursi Makan Modern Logam Linen Hitam	https://i.pinimg.com/1200x/69/db/55/69db55794fd2d37e4ee90a45102385bc.jpg	Kursi	Logam + Linen	Modern	Hitam	Ruang Makan	Produk bergaya Modern dengan material Logam + Linen dan warna Hitam, cocok untuk ruang makan modern.	1350000.00	16	active	2026-06-13 17:58:55.502698	2026-06-13 19:41:17.33006	Tidak Ada
3881b5a5-e3ce-41f8-a5b7-c4e5cdb7cd03	Kursi Mini Bar Modern Logam Linen Hitam	https://i.pinimg.com/736x/f3/44/da/f344da02e7d8a37ae801a35f20c5fff1.jpg	Kursi	Logam + Linen	Modern	Hitam	Mini Bar	Produk bergaya Modern dengan material Logam + Linen dan warna Hitam, cocok untuk mini bar.	1450000.00	15	active	2026-06-13 17:58:55.502698	2026-06-13 19:47:50.229662	Tidak Ada
f2b3b665-e490-4844-ac7e-a9b67c388a84	Kursi Mini Bar Japandi Kayu Linen Natural	https://i.pinimg.com/1200x/d7/fc/bf/d7fcbfcdb1e811d8c92953205f4a0dd6.jpg	Kursi	Kayu + Linen	Japandi	Natural	Mini Bar	Produk bergaya Japandi dengan material Kayu + Linen dan warna Natural, cocok untuk mini bar natural.	1420000.00	14	active	2026-06-13 17:58:55.502698	2026-06-13 19:49:02.303924	Tidak Ada
8b13d763-9ca9-4902-9ed4-60579b43609e	Kursi Santai Ruang Tamu Minimalis Abu	https://i.pinimg.com/736x/93/6f/92/936f925dbd5b940dfda8c3eddbe2dbb9.jpg	Kursi	Kayu + Linen	Minimalis	Abu-abu	Ruang Tamu	Produk bergaya Minimalis dengan material Kayu + Linen dan warna Abu-abu, cocok untuk ruang tamu santai.	1750000.00	12	active	2026-06-13 17:58:55.502698	2026-06-13 19:51:57.3374	Tidak Ada
4bcc38a2-2682-4dec-9345-3af476d6c191	Kursi Dapur Minimalis Kayu Linen Putih	https://i.pinimg.com/1200x/49/6d/a9/496da952687ca7bb2185b49b60bc756f.jpg	Kursi	Kayu + Linen	Minimalis	Putih	Dapur	Produk bergaya Minimalis dengan material Kayu + Linen dan warna Putih, cocok untuk dapur compact.	1180000.00	10	active	2026-06-13 17:58:55.502698	2026-06-13 19:55:34.256415	Tidak Ada
1761ed80-b3ea-4c66-af7f-717007460541	Meja Dapur Modern HPL Solid Putih	https://i.pinimg.com/1200x/a5/7d/37/a57d3712972e6281833193ced50bf921.jpg	Meja	HPL	Modern	Putih	Dapur	Produk bergaya Modern dengan material HPL Solid dan warna Putih, cocok untuk area kerja dapur.	3100000.00	9	active	2026-06-13 17:58:55.502698	2026-06-13 20:45:21.829579	Marble
0285c0fe-d977-4a9f-8ff6-d38caef991b2	Meja Makan Japandi Kayu Natural	https://i.pinimg.com/1200x/8e/8c/19/8e8c19185721d6989ead61c6c32be05a.jpg	Meja	Kayu	Japandi	Natural	Ruang Makan	Produk bergaya Japandi dengan material Kayu dan warna Natural, cocok untuk ruang makan hangat.	4200000.00	14	active	2026-06-13 17:58:55.502698	2026-06-13 20:32:26.191395	Tidak Ada
db1ff15e-6cd1-4ba5-86ab-67951b1e8a07	Meja Makan Modern Kayu Logam Hitam	https://i.pinimg.com/1200x/12/56/2a/12562a0b66a6b11da49521e06b62b34b.jpg	Meja	Kayu + Logam	Modern	Hitam	Ruang Makan	Produk bergaya Modern dengan material Kayu + Logam Glossy dan warna Hitam, cocok untuk ruang makan modern.	4800000.00	12	active	2026-06-13 17:58:55.502698	2026-06-13 20:35:41.764915	Glossy
5919e0cb-a628-4df0-a83a-39915fa4b25f	Meja Tamu Minimalis HPL Marble Putih	https://i.pinimg.com/736x/06/8d/d8/068dd81c30d978ade798d34c62082000.jpg	Meja	HPL	Minimalis	Putih	Ruang Tamu	Produk bergaya Minimalis dengan material HPL Marble dan warna Putih, cocok untuk ruang tamu terang.	2600000.00	10	active	2026-06-13 17:58:55.502698	2026-06-13 20:36:37.143892	Marble
4e38d0b7-e91d-4fc3-a1bf-d8d2fdddf59d	Meja Tamu Japandi Kayu Beige	https://i.pinimg.com/736x/40/3d/58/403d582af535d7c75b9591a03bdd5645.jpg	Meja	Kayu	Japandi	Beige	Ruang Tamu	Produk bergaya Japandi dengan material Kayu dan warna Beige, cocok untuk ruang tamu natural.	2450000.00	11	active	2026-06-13 17:58:55.502698	2026-06-13 20:42:27.108784	Tidak Ada
44f2fd04-2e96-4186-a10c-926f1e5d9828	Minibar Minimalis Kaca Glossy Hitam	https://i.pinimg.com/1200x/28/a9/4f/28a94fe6e95e3d51450d0e1d2a2a20fc.jpg	Minibar	Kaca	Minimalis	Hitam	Mini Bar	Produk bergaya Minimalis dengan material Kaca Glossy dan warna Hitam, cocok untuk mini bar compact.	8700000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 20:46:11.907459	Glossy
8c7a0263-f3bc-4eaa-a51a-e8fb4290ade2	Minibar Modern HPL Solid Hitam	https://i.pinimg.com/736x/fa/4b/b6/fa4bb6400e1064664b76c88c3d32fb7a.jpg	Minibar	HPL	Modern	Hitam	Mini Bar	Produk bergaya Modern dengan material HPL Solid dan warna Hitam, cocok untuk area mini bar yang tegas.	8900000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 20:48:59.696602	Solid
46a0030a-662c-4baf-a95a-dc28b6a5db09	Minibar Japandi HPL Woodgrain Natural	https://i.pinimg.com/736x/fd/ed/cb/fdedcb466227558fdcb4fd996b3754d4.jpg	Minibar	HPL	Japandi	Natural	Mini Bar	Produk bergaya Japandi dengan material HPL Woodgrain dan warna Natural, cocok untuk mini bar natural.	9200000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 20:50:06.12846	Woodgrain
de6b69ac-caab-4e2e-970b-6b39d4df2979	Minibar Minimalis HPL Marble Putih	https://i.pinimg.com/736x/fc/24/52/fc2452b307ac289b135c6d96d0921797.jpg	Minibar	HPL	Minimalis	Putih	Mini Bar	Produk bergaya Minimalis dengan material HPL Marble dan warna Putih, cocok untuk mini bar bersih.	9400000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 20:51:51.984036	Marble
5911eb07-3abf-4a4c-965a-dd53bd2dd463	Minibar Modern HPL Kaca Glossy Abu	https://i.pinimg.com/1200x/b1/29/57/b129571854d43ab4709448022b0e27cd.jpg	Minibar	HPL + Kaca	Modern	Abu-abu	Mini Bar	Produk bergaya Modern dengan material HPL + Kaca Glossy dan warna Abu-abu, cocok untuk mini bar modern.	9800000.00	\N	active	2026-06-13 17:58:55.502698	2026-06-13 20:54:22.159963	Glossy
bab1f3f5-f0e0-4af1-83d6-fd7e6efae906	Meja Rias Minimalis HPL Solid Coklat	https://i.pinimg.com/1200x/71/62/b3/7162b315cb93b6d92a4f87942a753ec5.jpg	Meja Rias	HPL	Minimalis	Coklat	Kamar Tidur	Produk bergaya Minimalis dengan material HPL Solid dan warna Coklat, cocok untuk kamar tidur hangat.	3400000.00	9	active	2026-06-13 17:58:55.502698	2026-06-13 18:31:49.420204	Solid
e4e5b95a-1fe1-4365-88a9-6acbdbe0014a	Meja Rias Japandi HPL Woodgrain Beige	https://i.pinimg.com/736x/d3/65/97/d3659783d003453b79e2c43ad8d3451b.jpg	Meja Rias	HPL	Japandi	Beige	Kamar Tidur	Produk bergaya Japandi dengan material HPL Woodgrain dan warna Beige, cocok untuk kamar tidur hangat.	3600000.00	10	active	2026-06-13 17:58:55.502698	2026-06-13 18:42:22.982796	Woodgrain
5a8be876-0039-45db-affc-b76c239fd7a9	Meja Rias Modern HPL Solid Putih	https://i.pinimg.com/736x/73/d0/69/73d069e6cc3a2f702a7ecf20c33d5eff.jpg	Meja Rias	HPL	Modern	Putih	Kamar Tidur	Produk bergaya Modern dengan material HPL Solid dan warna Putih, cocok untuk kamar tidur modern.	3800000.00	9	active	2026-06-13 17:58:55.502698	2026-06-13 18:47:06.675854	Solid
11eb78a2-d137-4055-ae4d-af6956c087fc	Meja Rias Minimalis HPL Marble Abu	https://i.pinimg.com/1200x/5f/d4/f3/5fd4f38738fecae76121b396e6f6d619.jpg	Meja Rias	HPL	Minimalis	Abu-abu	Kamar Tidur	Produk bergaya Minimalis dengan material HPL Marble dan warna Abu-abu, cocok untuk kamar tidur netral.	3500000.00	8	active	2026-06-13 17:58:55.502698	2026-06-13 18:55:08.539477	Marble
1bd28939-88cf-4937-b3a6-64a3bc071a75	Meja Rias Modern HPL Kaca Glossy Hitam	https://i.pinimg.com/1200x/db/10/6a/db106af58d61aac6bcee3615e9a4c0d8.jpg	Meja Rias	HPL + Kaca	Modern	Hitam	Kamar Tidur	Produk bergaya Modern dengan material HPL + Kaca Glossy dan warna Hitam, cocok untuk kamar tidur tegas.	4100000.00	7	active	2026-06-13 17:58:55.502698	2026-06-13 18:57:12.941551	Glossy
a159fdec-08e3-4641-b8ce-161082cee933	Meja Rias Japandi Kayu Natural	https://i.pinimg.com/736x/14/dc/56/14dc560c1cd426953afef2008b9a14b5.jpg	Meja Rias	Kayu	Japandi	Natural	Kamar Tidur	Produk bergaya Japandi dengan material Kayu dan warna Natural, cocok untuk kamar tidur natural.	3700000.00	8	active	2026-06-13 17:58:55.502698	2026-06-13 18:59:21.154467	Tidak Ada
feba5885-7b1a-4baf-a37f-babbbb1c9bb8	Nakas Minimalis HPL Solid Coklat	https://i.pinimg.com/1200x/53/8b/9e/538b9e7b372602094d63b87466093bc7.jpg	Nakas	HPL	Minimalis	Coklat	Kamar Tidur	Produk bergaya Minimalis dengan material HPL Solid dan warna Coklat, cocok untuk kamar tidur hangat.	1380000.00	12	active	2026-06-13 17:58:55.502698	2026-06-13 19:14:19.117194	Solid
2bb5ea6f-9f28-4d1b-994c-9323df7070e0	Nakas Modern HPL Solid Putih	https://i.pinimg.com/1200x/81/2f/7e/812f7e8c932221186d022ecf0753434c.jpg	Nakas	HPL	Modern	Putih	Kamar Tidur	Produk bergaya Modern dengan material HPL Solid dan warna Putih, cocok untuk kamar tidur modern.	1500000.00	15	active	2026-06-13 17:58:55.502698	2026-06-13 19:16:42.531183	Solid
2961254f-64cd-4f42-a7cd-118b9bcb2355	Nakas Minimalis HPL Marble Abu	https://i.pinimg.com/1200x/ed/bf/f3/edbff3037d8912c3cf193aaa596e180f.jpg	Nakas	HPL	Minimalis	Abu-abu	Kamar Tidur	Produk bergaya Minimalis dengan material HPL Marble dan warna Abu-abu, cocok untuk kamar tidur netral.	1420000.00	13	active	2026-06-13 17:58:55.502698	2026-06-13 19:18:12.486023	Marble
55e19f7c-4b18-49a6-acf2-25c5e3f4a6e3	Nakas Japandi Kayu Natural	https://i.pinimg.com/1200x/67/05/64/670564d8fcb585f2ee73c07dbe907c0c.jpg	Nakas	Kayu	Japandi	Natural	Kamar Tidur	Produk bergaya Japandi dengan material Kayu dan warna Natural, cocok untuk kamar tidur natural.	1550000.00	14	active	2026-06-13 17:58:55.502698	2026-06-13 19:25:26.174732	Tidak Ada
e53634db-7e04-449e-9ef7-eabecf4306f1	Nakas Modern HPL Kaca Glossy Hitam	https://i.pinimg.com/1200x/2d/85/b7/2d85b786f285e2ad8948642315edf233.jpg	Nakas	HPL + Kaca	Modern	Hitam	Kamar Tidur	Produk bergaya Modern dengan material HPL + Kaca Glossy dan warna Hitam, cocok untuk kamar tidur tegas.	1680000.00	10	active	2026-06-13 17:58:55.502698	2026-06-13 19:26:38.884337	Glossy
27db436d-3dcb-4b7b-9f93-c6d8f0054569	Nakas Japandi HPL Woodgrain Beige	https://i.pinimg.com/1200x/ee/80/6c/ee806c3077f9c0f5919201c1384b14d6.jpg	Nakas	HPL	Japandi	Beige	Kamar Tidur	Produk bergaya Japandi dengan material HPL Woodgrain dan warna Beige, cocok untuk sisi tempat tidur.	1450000.00	16	active	2026-06-13 17:58:55.502698	2026-06-13 19:27:48.251024	Woodgrain
8c259344-c651-4174-baf3-79ee6ff38726	Lemari Pakaian Japandi Kayu Natural	https://i.pinimg.com/1200x/3c/a9/a8/3ca9a81b50b87abb97c54cceb005dbb3.jpg	Lemari	Kayu	Japandi	Natural	Kamar Tidur	Produk bergaya Japandi dengan material Kayu dan warna Natural, cocok untuk kamar tidur natural.	7200000.00	8	active	2026-06-13 17:58:55.502698	2026-06-13 19:30:04.697733	Tidak Ada
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
hnfXex2ICmGpPH83kSHq-n6pSLYNjYKP	{"cookie":{"originalMaxAge":86400000,"expires":"2026-07-07T09:28:18.691Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":"a9220074-5cef-4591-b6ad-0833bc7ac532","google_id":null,"username":"admin","email":"admin@example.com","name":"Admin Demo","avatar_url":null,"role":"admin","auth_provider":"local","created_at":"2026-06-09T17:52:58.867Z","updated_at":"2026-06-09T20:58:54.157Z"}}	2026-07-07 19:58:41
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, google_id, email, name, avatar_url, role, created_at, updated_at, username, password_hash, auth_provider) FROM stdin;
e15d492a-b09f-48e2-88be-fee04af9ae03	google-user-001	user1@example.com	User Satu	\N	user	2026-06-10 00:52:58.867711	2026-06-10 00:52:58.867711	\N	\N	google
d9f8420e-4355-49b9-90d6-a699cfd5dee5	google-user-002	user2@example.com	User Dua	\N	user	2026-06-10 00:52:58.867711	2026-06-10 00:52:58.867711	\N	\N	google
7e8c8b40-176c-4eb6-97b2-a39da4acf39b	google-user-003	user3@example.com	User Tiga	\N	user	2026-06-10 00:52:58.867711	2026-06-10 00:52:58.867711	\N	\N	google
5e2d1a3f-1bbc-4085-a2e7-7ac50a74f8b8	118141632152190119465	flucidchart@gmail.com	Flow chart Lucid chart	https://lh3.googleusercontent.com/a/ACg8ocKZ-o0CU3KW_2WG53LucqKm_ZPJMjEPuBcLDPe-8MimbK68qw=s96-c	user	2026-06-10 03:17:28.780707	2026-06-10 03:17:28.780707	\N	\N	google
a9220074-5cef-4591-b6ad-0833bc7ac532	\N	admin@example.com	Admin Demo	\N	admin	2026-06-10 00:52:58.867711	2026-06-10 03:58:54.157841	admin	$2b$10$/luF04I3TgZ9zJEth49R3.X.sGH1J4GBtlO1ReZaeCwq7d5FzrjrK	local
203a1744-a19f-4780-8834-2cbfc5e39d00	\N	userdemo@example.com	User Demo	\N	user	2026-06-10 03:58:54.157841	2026-06-10 03:58:54.157841	userdemo	$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i	local
08841df8-e9df-484e-ae2b-85e339c05ea9	\N	newuser20260610035943@example.com	New User	\N	user	2026-06-10 03:59:44.043667	2026-06-10 03:59:44.043667	newuser20260610035943	$2b$10$tmtwGAuTc.fbWkR9Yb87puZ1Viz41gEJcO6EKkQkoQ0Rs3LGYJJDy	local
0b8676fd-ee36-40c3-b57e-8a7d0d5e3aa4	\N	userrrrrrr.1@gmail.com	user ke satu	\N	user	2026-06-10 13:36:19.169054	2026-06-10 13:36:19.169054	user1	$2b$10$wy53.nc9SlH/ukVnWu4It.4Wfpsr9K.xLmhzBf/PeM98q0Je62LiO	local
15c78fa4-181e-4949-9c87-b93d6cbff62e	\N	leeeeonnnskennedy@gmail.com	Leon	\N	user	2026-06-13 15:49:09.127516	2026-06-13 15:49:09.127516	leons	$2b$10$r2vr9HF3CHx64jS9S467MeRvFip/PC6OI/Mp1eHB7vRPRKYO6rI/a	local
98513440-1173-48c4-bc5f-feb4ac0d1a1a	\N	user_japandi_kamar@example.com	User Japandi Kamar	\N	user	2026-06-13 17:55:03.743712	2026-06-13 17:58:55.502698	user_japandi_kamar	$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i	local
e836a5a4-dddc-4c8b-a9ed-5eb1f6f0b3b6	\N	user_modern_kamar@example.com	User Modern Kamar	\N	user	2026-06-13 17:55:03.743712	2026-06-13 17:58:55.502698	user_modern_kamar	$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i	local
72eb5795-6e8f-401c-bb38-6935f94d50a5	\N	user_minimalis_kamar@example.com	User Minimalis Kamar	\N	user	2026-06-13 17:55:03.743712	2026-06-13 17:58:55.502698	user_minimalis_kamar	$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i	local
3fe804ac-e4fa-45d6-a957-5eedb344cf34	\N	user_ruang_tamu_japandi@example.com	User Ruang Tamu Japandi	\N	user	2026-06-13 17:55:03.743712	2026-06-13 17:58:55.502698	user_ruang_tamu_japandi	$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i	local
d65bd0aa-ae34-438c-b739-9b8cac0debf7	\N	user_ruang_tamu_modern@example.com	User Ruang Tamu Modern	\N	user	2026-06-13 17:55:03.743712	2026-06-13 17:58:55.502698	user_ruang_tamu_modern	$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i	local
753e480b-b90f-4e3e-9eb2-43dc15f2ce53	\N	user_dapur_modern@example.com	User Dapur Modern	\N	user	2026-06-13 17:55:03.743712	2026-06-13 17:58:55.502698	user_dapur_modern	$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i	local
886997b8-f78b-4c96-a236-f96367cd627f	\N	user_dapur_japandi@example.com	User Dapur Japandi	\N	user	2026-06-13 17:55:03.743712	2026-06-13 17:58:55.502698	user_dapur_japandi	$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i	local
d7c42c6f-2272-42f8-bd70-e7266f387022	\N	user_minibar_modern@example.com	User Minibar Modern	\N	user	2026-06-13 17:55:03.743712	2026-06-13 17:58:55.502698	user_minibar_modern	$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i	local
cc8c3c7f-702f-4cd2-ad2d-ad8659328dca	\N	user_minibar_japandi@example.com	User Minibar Japandi	\N	user	2026-06-13 17:55:03.743712	2026-06-13 17:58:55.502698	user_minibar_japandi	$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i	local
6343cd38-881a-41fa-9ca4-d154a8fde81b	\N	user_ruang_makan_japandi@example.com	User Ruang Makan Japandi	\N	user	2026-06-13 17:55:03.743712	2026-06-13 17:58:55.502698	user_ruang_makan_japandi	$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i	local
f07f617a-9830-4b62-8751-bb062f69a49a	\N	user_ruang_makan_modern@example.com	User Ruang Makan Modern	\N	user	2026-06-13 17:55:03.743712	2026-06-13 17:58:55.502698	user_ruang_makan_modern	$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i	local
25640b49-b7ce-401e-9e44-38b5074375b2	\N	user_mixed_minimalis@example.com	User Mixed Minimalis	\N	user	2026-06-13 17:55:03.743712	2026-06-13 17:58:55.502698	user_mixed_minimalis	$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i	local
84e2dc95-64c7-4567-8780-20ddd0015c51	\N	adawong@gmail.com	Ada Wong	\N	user	2026-06-13 18:28:44.667416	2026-06-13 18:28:44.667416	adaw	$2b$10$DagVyebNGYgle.3gDwRzc.v5FiZ/gst1YpjxZScU5hTbreypr0Qt6	local
563d7996-cb3c-4973-8bf0-6c665723de8f	106477380014206896347	luciennortice@gmail.com	Lucien Nortice	https://lh3.googleusercontent.com/a/ACg8ocITTxcH5r1MY8dRSzSHPNhyfiegtQSAoYNFvwuJUkiEtV7SjQI=s96-c	user	2026-06-13 19:57:11.325797	2026-06-13 19:57:11.325797	\N	\N	google
99d53037-35b0-4dc6-8482-b86c4385bcda	\N	test1@gmail.com	test1	\N	user	2026-06-18 01:14:13.793917	2026-06-18 01:14:13.793917	test1	$2b$10$/nIM5ymdaZ/BgV5NyXZzQeobBeQl/Srrg9.9Ufh6uvPDW7ESOGmdG	local
\.


--
-- Name: interactions interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT interactions_pkey PRIMARY KEY (id);


--
-- Name: product_likes product_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_likes
    ADD CONSTRAINT product_likes_pkey PRIMARY KEY (id);


--
-- Name: product_likes product_likes_user_product_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_likes
    ADD CONSTRAINT product_likes_user_product_unique UNIQUE (user_id, product_id);


--
-- Name: product_wishlists product_wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_wishlists
    ADD CONSTRAINT product_wishlists_pkey PRIMARY KEY (id);


--
-- Name: product_wishlists product_wishlists_user_product_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_wishlists
    ADD CONSTRAINT product_wishlists_user_product_unique UNIQUE (user_id, product_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_interactions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interactions_created_at ON public.interactions USING btree (created_at);


--
-- Name: idx_interactions_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interactions_product_id ON public.interactions USING btree (product_id);


--
-- Name: idx_interactions_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interactions_type ON public.interactions USING btree (interaction_type);


--
-- Name: idx_interactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interactions_user_id ON public.interactions USING btree (user_id);


--
-- Name: idx_interactions_user_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interactions_user_product ON public.interactions USING btree (user_id, product_id);


--
-- Name: idx_product_likes_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_likes_product_id ON public.product_likes USING btree (product_id);


--
-- Name: idx_product_likes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_likes_user_id ON public.product_likes USING btree (user_id);


--
-- Name: idx_product_likes_user_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_likes_user_product ON public.product_likes USING btree (user_id, product_id);


--
-- Name: idx_product_wishlists_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_wishlists_product_id ON public.product_wishlists USING btree (product_id);


--
-- Name: idx_product_wishlists_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_wishlists_user_id ON public.product_wishlists USING btree (user_id);


--
-- Name: idx_product_wishlists_user_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_wishlists_user_product ON public.product_wishlists USING btree (user_id, product_id);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category ON public.products USING btree (category);


--
-- Name: idx_products_material_variant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_material_variant ON public.products USING btree (material_variant);


--
-- Name: idx_products_metadata; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_metadata ON public.products USING btree (category, material, material_variant, style_theme, dominant_color, room_category);


--
-- Name: idx_products_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_status ON public.products USING btree (status);


--
-- Name: idx_sessions_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_expire ON public.sessions USING btree (expire);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_google_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_google_id ON public.users USING btree (google_id);


--
-- Name: idx_users_username_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_users_username_unique ON public.users USING btree (username) WHERE (username IS NOT NULL);


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: interactions interactions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT interactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: interactions interactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: product_likes product_likes_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_likes
    ADD CONSTRAINT product_likes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_likes product_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_likes
    ADD CONSTRAINT product_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: product_wishlists product_wishlists_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_wishlists
    ADD CONSTRAINT product_wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_wishlists product_wishlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_wishlists
    ADD CONSTRAINT product_wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict SChbRDUFddqQJfGZUD8wC6gcBcpZkvj6YlHkaoxaMujhrObDwvoHcGEaS1jFndk

