// Stand-in for Drupal's /graphql in tests. No dependencies: the schema has
// two queries and the fixtures are small. POST /__control {"mode": ...}:
//   "up"   normal fixtures (default)
//   "down" answers 503, to rehearse "the backend is down"
//   "v2"   same municipalities, next hour's numbers, to rehearse revalidation
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_GRAPHQL_PORT ?? 4001);

const measurement = (over = {}) => ({
  source: "open_meteo",
  sensorId: "model",
  measuredAt: "2026-09-13T10:00:00+00:00",
  fetchedAt: "2026-09-13T10:05:00+00:00",
  pm25: 8.0,
  pm10: 11.4,
  eaqi: 38,
  humidity: 40,
  ...over,
});
const sensor = (id, over = {}) =>
  measurement({
    source: "sensor_community",
    sensorId: id,
    eaqi: null,
    ...over,
  });

let mode = "up";

const OPSTINE = [
  {
    slug: "vracar",
    name: "Vračar",
    lat: 44.7987,
    lon: 20.4764,
    eaqi: 38,
    eaqi2: 45,
    sensors: [
      sensor("33180"),
      sensor("56451", { pm25: 1.2 }),
      sensor("90113", { humidity: 82 }),
    ],
  },
  {
    slug: "zemun",
    name: "Zemun",
    lat: 44.8464,
    lon: 20.3823,
    eaqi: 55,
    eaqi2: 62,
    sensors: [sensor("26317", { pm25: 12.5 })],
  },
  {
    slug: "rakovica",
    name: "Rakovica",
    lat: 44.7396,
    lon: 20.4457,
    eaqi: null,
    eaqi2: null,
    sensors: [],
  },
];

// "v2" = the next hour's numbers, so tests can tell a rebuilt page from a cached one.
const opstinaRow = (o) => {
  const eaqi = mode === "v2" ? o.eaqi2 : o.eaqi;
  const measuredAt =
    mode === "v2" ? "2026-09-13T11:00:00+00:00" : "2026-09-13T10:00:00+00:00";
  return {
    slug: o.slug,
    name: o.name,
    lat: o.lat,
    lon: o.lon,
    model:
      eaqi === null ? null : measurement({ eaqi, pm25: eaqi / 4, measuredAt }),
    sensors: o.sensors,
  };
};

const server = createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    if (req.url === "/__control") {
      mode = JSON.parse(body || "{}").mode ?? "up";
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ mode }));
    }
    if (req.method === "OPTIONS") {
      res.writeHead(204, cors());
      return res.end();
    }
    if (mode === "down") {
      res.writeHead(503, { ...cors(), "content-type": "text/plain" });
      return res.end("mock backend is down");
    }
    const { query = "", variables = {} } = JSON.parse(body || "{}");
    let data;
    if (/opstina\s*\(/.test(query)) {
      const o = OPSTINE.find((x) => x.slug === variables.slug);
      data = { opstina: o ? opstinaRow(o) : null };
    } else {
      data = { opstine: OPSTINE.map(opstinaRow) };
    }
    res.writeHead(200, { ...cors(), "content-type": "application/json" });
    res.end(JSON.stringify({ data }));
  });
});

function cors() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}

server.listen(PORT, () =>
  console.log(`mock graphql on http://localhost:${PORT}/graphql`),
);
