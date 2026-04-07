import { api } from "@/api/client";

function deserialize(appt) {
  return {
    ...appt,
    start:    new Date(appt.start),
    end:      new Date(appt.end),
    services: appt.services || [],
  };
}

export const appointmentsService = {
  list({ from, to } = {}) {
    const params = new URLSearchParams();
    if (from) params.set("from", from.toISOString());
    if (to) params.set("to", to.toISOString());
    const query = params.toString();
    return api(`/api/appointments${query ? `?${query}` : ""}`)
      .then((data) => data.map(deserialize));
  },

  async create(body) {
    const data = await api("/api/appointments", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return deserialize(data);
  },

  async update(id, body) {
    const data = await api(`/api/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return deserialize(data);
  },

  delete(id) {
    return api(`/api/appointments/${id}`, { method: "DELETE" });
  },
};
