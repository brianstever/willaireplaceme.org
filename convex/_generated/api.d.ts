/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as blsFetch from "../blsFetch.js";
import type * as crons from "../crons.js";
import type * as jobMutations from "../jobMutations.js";
import type * as jobs from "../jobs.js";
import type * as usajobsFetch from "../usajobsFetch.js";
import type * as usajobsMutations from "../usajobsMutations.js";
import type * as usajobsQueries from "../usajobsQueries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  blsFetch: typeof blsFetch;
  crons: typeof crons;
  jobMutations: typeof jobMutations;
  jobs: typeof jobs;
  usajobsFetch: typeof usajobsFetch;
  usajobsMutations: typeof usajobsMutations;
  usajobsQueries: typeof usajobsQueries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
