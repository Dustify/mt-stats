--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2 (Debian 16.2-1.pgdg120+2)
-- Dumped by pg_dump version 16.2 (Ubuntu 16.2-1.pgdg22.04+1)

-- Started on 2024-04-19 11:23:21 BST

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
-- TOC entry 217 (class 1255 OID 16385)
-- Name: _final_median(numeric[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public._final_median(numeric[]) RETURNS numeric
    LANGUAGE sql IMMUTABLE
    AS $_$
   SELECT AVG(val)
   FROM (
     SELECT val
     FROM unnest($1) val
     ORDER BY 1
     LIMIT  2 - MOD(array_upper($1, 1), 2)
     OFFSET CEIL(array_upper($1, 1) / 2.0) - 1
   ) sub;
$_$;


ALTER FUNCTION public._final_median(numeric[]) OWNER TO postgres;

--
-- TOC entry 846 (class 1255 OID 16386)
-- Name: median(numeric); Type: AGGREGATE; Schema: public; Owner: postgres
--

CREATE AGGREGATE public.median(numeric) (
    SFUNC = array_append,
    STYPE = numeric[],
    INITCOND = '{}',
    FINALFUNC = public._final_median
);


ALTER AGGREGATE public.median(numeric) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 16387)
-- Name: raw_pb; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.raw_pb (
    data bytea,
    expanded boolean DEFAULT false,
    packet_from bigint,
    packet_to bigint,
    packet_decoded_portnum character varying(128),
    "packet_decoded_wantResponse" boolean,
    packet_id bigint,
    "packet_rxTime" bigint,
    "packet_hopLimit" integer,
    "packet_wantAck" boolean,
    "channelId" character varying(128),
    "gatewayId" character varying(128),
    packet_decoded_payload character varying(1024),
    "packet_rxSnr" numeric,
    "packet_rxRssi" numeric,
    "packet_decoded_requestId" bigint,
    packet_priority character varying(32),
    extracted boolean DEFAULT false,
    "NODEINFO_APP_id" character varying(32),
    "NODEINFO_APP_longName" character varying(256),
    "NODEINFO_APP_shortName" character varying(8),
    "NODEINFO_APP_macaddr" character varying(16),
    "NODEINFO_APP_hwModel" character varying(128),
    "TRACEROUTE_APP_route" character varying(1024),
    "POSITION_APP_latitudeI" bigint,
    "POSITION_APP_longitudeI" bigint,
    "POSITION_APP_altitude" bigint,
    "POSITION_APP_time" bigint,
    "POSITION_APP_precisionBits" integer,
    "TELEMETRY_APP_time" bigint,
    "TELEMETRY_APP_deviceMetrics_batteryLevel" integer,
    "TELEMETRY_APP_deviceMetrics_voltage" numeric,
    "TELEMETRY_APP_deviceMetrics_airUtilTx" numeric,
    "TELEMETRY_APP_deviceMetrics_channelUtilization" numeric,
    "POSITION_APP_PDOP" integer,
    "POSITION_APP_groundSpeed" numeric,
    "POSITION_APP_satsInView" integer,
    "TELEMETRY_APP_environmentMetrics_temperature" numeric,
    "TELEMETRY_APP_environmentMetrics_relativeHumidity" numeric,
    "TELEMETRY_APP_environmentMetrics_barometricPressure" numeric,
    "NODEINFO_APP_role" character varying(128),
    "ROUTING_APP_errorReason" character varying(128),
    "POSITION_APP_groundTrack" numeric,
    "TEXT_MESSAGE_APP_value" character varying(2048),
    "timestamp" timestamp with time zone,
    "POSITION_APP_timestamp" bigint,
    "POSITION_APP_seqNumber" bigint,
    "packet_hopStart" integer,
    id integer NOT NULL,
    "NODEINFO_APP_isLicensed" boolean,
    "packet_decoded_replyId" bigint,
    packet_decoded_emoji bigint,
    "ADMIN_APP_setOwner_longName" character varying(128),
    "ADMIN_APP_setOwner_shortName" character varying(8),
    "ADMIN_APP_beginEditSettings" boolean,
    "RANGE_TEST_APP_value" character varying(128),
    packet_channel bigint,
    "STORE_FORWARD_APP_rr" character varying(1024),
    "STORE_FORWARD_APP_heartbeat_period" bigint,
    "TELEMETRY_APP_deviceMetrics_uptimeSeconds" bigint
);


ALTER TABLE public.raw_pb OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16394)
-- Name: raw_pb_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.raw_pb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.raw_pb_id_seq OWNER TO postgres;

--
-- TOC entry 3359 (class 0 OID 0)
-- Dependencies: 216
-- Name: raw_pb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.raw_pb_id_seq OWNED BY public.raw_pb.id;


--
-- TOC entry 3207 (class 2604 OID 16395)
-- Name: raw_pb id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raw_pb ALTER COLUMN id SET DEFAULT nextval('public.raw_pb_id_seq'::regclass);


--
-- TOC entry 3210 (class 2606 OID 16397)
-- Name: raw_pb raw_pb_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raw_pb
    ADD CONSTRAINT raw_pb_pkey PRIMARY KEY (id);


--
-- TOC entry 3208 (class 1259 OID 33076)
-- Name: raw_pb_gateway_timestamp_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX raw_pb_gateway_timestamp_idx ON public.raw_pb USING btree ("gatewayId", "timestamp");


-- Completed on 2024-04-19 11:23:21 BST

--
-- PostgreSQL database dump complete
--

