/**
 * Minimal GraphQL transport for server components.
 *
 * A GraphQL request is a POST with { query, variables }. No client library is
 * needed on the server: fetch already gives us Next.js caching (revalidate,
 * tags) and Apollo would only get in the way of it. Apollo lives on the
 * client side for interactive parts.
 */

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL;

/** Tag every GraphQL fetch with `air` so /api/revalidate can expire it. */
const CACHE: NextFetchRequestConfig = { revalidate: 3600, tags: ["air"] };

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string; path?: (string | number)[] }[];
};

export class GraphQLError extends Error {
  constructor(
    message: string,
    public readonly query: string,
  ) {
    super(message);
    this.name = "GraphQLError";
  }
}

export async function gql<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!GRAPHQL_URL) {
    throw new Error("NEXT_PUBLIC_GRAPHQL_URL is not set");
  }

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: CACHE,
  });

  if (!response.ok) {
    throw new GraphQLError(
      `GraphQL endpoint responded with ${response.status}`,
      query,
    );
  }

  // GraphQL reports resolver errors with HTTP 200 and an `errors` array;
  // response.ok says nothing about them.
  const body = (await response.json()) as GraphQLResponse<T>;
  if (body.errors?.length) {
    throw new GraphQLError(body.errors.map((e) => e.message).join("; "), query);
  }
  if (body.data === undefined) {
    throw new GraphQLError("GraphQL response has no data", query);
  }
  return body.data;
}
