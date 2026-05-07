const axios = require("axios");

// 🔐 API key desde variables de entorno
const GOOGLE_API_KEY_MAPS = process.env.GOOGLE_API_KEY_MAPS;

const getNearbyPsychologists = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    // 🔒 Validación básica
    if (!lat || !lng) {
      return res.status(400).json({
        error: "Debes enviar lat y lng",
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        error: "Coordenadas inválidas",
      });
    }

    // 🔐 Reducir precisión (privacidad)
    const safeLat = Number(userLat.toFixed(5));
    const safeLng = Number(userLng.toFixed(5));

    // 📍 Request a Google Places API (CORREGIDO)
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${safeLat},${safeLng}`,
          radius: 3000,
          keyword: "psicologo terapia salud mental psychologist",
          key: GOOGLE_API_KEY_MAPS,
        },
        timeout: 5000,
      }
    );

    // 🚨 Manejo de errores de Google
    if (
      response.data.status !== "OK" &&
      response.data.status !== "ZERO_RESULTS"
    ) {
      return res.status(500).json({
        error: "Error en Google Places",
        details: response.data.status,
      });
    }

    const results = response.data.results || [];

    // 🧠 FILTRO INTELIGENTE (evita hoteles, clubs, etc.)
    const psychologists = results
      .filter((place) => {
        const name = place.name?.toLowerCase() || "";
        const types = place.types || [];

        return (
          name.includes("psic") ||
          name.includes("therapy") ||
          name.includes("mental") ||
          types.includes("health") ||
          types.includes("doctor")
        );
      })
      .slice(0, 5)
      .map((place) => ({
        name: place.name || "Sin nombre",
        address: place.vicinity || "Sin dirección",
        rating: place.rating ?? null,
        totalRatings: place.user_ratings_total ?? 0,
        openNow: place.opening_hours?.open_now ?? null,
        lat: place.geometry?.location?.lat ?? null,
        lng: place.geometry?.location?.lng ?? null,
        placeId: place.place_id,
      }));

    return res.json({
      count: psychologists.length,
      data: psychologists,
      nextPageToken: response.data.next_page_token || null,
    });

  } catch (error) {
    console.error("Axios error:", error.message);

    return res.status(500).json({
      error: "Error al obtener psicólogos",
    });
  }
};

module.exports = {
  getNearbyPsychologists,
};