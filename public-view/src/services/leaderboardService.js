// src/services/leaderboardService.js
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

const SCORE_WEIGHTS = { leads: 1, payins: 2, sales: 1.5 / 1000 };

function computePoints({ leads, payins, sales }) {
  return (
    (leads || 0) * SCORE_WEIGHTS.leads +
    (payins || 0) * SCORE_WEIGHTS.payins +
    (sales || 0) * SCORE_WEIGHTS.sales
  );
}

function mapSnapToMap(snap) {
  const m = new Map();
  snap.forEach((d) => m.set(d.id, d.data()));
  return m;
}

/**
 * weekRange: { start: Date, end: Date } | null
 * view: "leaders" | "depots" | "companies"
 */
export async function getLeaderboard(weekRange, view = "leaders") {
  // raw_data query (date range)
  let rawRef = collection(db, "raw_data");
  if (weekRange?.start && weekRange?.end) {
    rawRef = query(
      rawRef,
      where("date", ">=", weekRange.start),
      where("date", "<=", weekRange.end)
    );
  }

  const [rawSnap, agentsSnap, depotsSnap, companiesSnap, platoonsSnap] =
    await Promise.all([
      getDocs(rawRef),
      getDocs(collection(db, "agents")),
      getDocs(collection(db, "depots")),
      getDocs(collection(db, "companies")),
      getDocs(collection(db, "platoons")),
    ]);

  const agents = mapSnapToMap(agentsSnap);
  const depots = mapSnapToMap(depotsSnap);
  const companies = mapSnapToMap(companiesSnap);
  const platoons = mapSnapToMap(platoonsSnap);

  // helper: find agent meta even if raw_data used "name" as agentId before
  function resolveAgentMeta(agentId) {
    // normal: agentId == docId
    const direct = agents.get(agentId);
    if (direct) return { id: agentId, ...direct };

    // fallback: match by name (older raw_data used name strings)
    const found = Array.from(agents.entries()).find(([, v]) => v?.name === agentId);
    if (found) return { id: found[0], ...found[1] };

    return { id: agentId };
  }

  function getGroupKey(meta) {
    if (view === "leaders") return meta.id;

    // NEW schema first
    if (view === "depots") return meta.depotId || meta.depot || "unknown-depot";
    if (view === "companies") return meta.companyId || meta.company || "unknown-company";

    return meta.id;
  }

  function getGroupDisplay(key, meta) {
    if (view === "leaders") {
      const platoonName =
        platoons.get(meta.platoonId)?.name || meta.platoon || "";

      return {
        name: meta.name || meta.id,
        avatarUrl: meta.photoURL || "",
        platoon: platoonName,
      };
    }

    if (view === "depots") {
      const d = depots.get(key);
      return { name: d?.name || key, avatarUrl: d?.photoURL || "" };
    }

    if (view === "companies") {
      const c = companies.get(key);
      return { name: c?.name || key, avatarUrl: c?.photoURL || "" };
    }

    return { name: key, avatarUrl: "" };
  }

  // aggregate
  const groups = new Map();

  rawSnap.forEach((doc) => {
    const row = doc.data();
    const meta = resolveAgentMeta(row.agentId);

    const key = getGroupKey(meta);
    if (!groups.has(key)) {
      const display = getGroupDisplay(key, meta);
      groups.set(key, {
        key,
        name: display.name,
        avatarUrl: display.avatarUrl || "", // keep avatar only for leaders in UI
        platoon: display.platoon || "",
        leads: 0,
        payins: 0,
        sales: 0,
      });
    }

    const g = groups.get(key);
    g.leads += row.leads || 0;
    g.payins += row.payins || 0;
    g.sales += row.sales || 0;
  });

  const rows = Array.from(groups.values()).map((g) => ({
    ...g,
    points: computePoints(g),
  }));

  rows.sort((a, b) => b.points - a.points);
  rows.forEach((r, i) => (r.rank = i + 1));

  return {
    view,
    metrics: {
      entitiesCount: rows.length,
      totalLeads: rows.reduce((s, r) => s + r.leads, 0),
      totalSales: rows.reduce((s, r) => s + r.sales, 0),
    },
    rows,
  };
}
