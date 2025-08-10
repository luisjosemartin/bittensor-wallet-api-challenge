/* eslint-disable @typescript-eslint/no-explicit-any */
import * as express from "express";
import * as core from "express-serve-static-core";

export type Query = core.Query;

export type Params = core.ParamsDictionary;

export type Request<ReqBody = any, ReqQuery = Query, URLParams = Params> = express.Request<
  URLParams,
  any,
  ReqBody,
  ReqQuery
>;
