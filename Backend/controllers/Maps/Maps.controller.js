const axios = require("axios");

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

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
    const safeLat = userLat.toFixed(5);
    const safeLng = userLng.toFixed(5);

    // 📍 Request seguro con Axios
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${safeLat},${safeLng}`,
          radius: 5000,
          keyword: "psychologist",
          key: GOOGLE_API_KEY,
        },
        timeout: 5000, // evita ataques lentos
      }
    );

    const results = response.data.results || [];

    // 🧠 Limpiar datos
    const psychologists = results.map((place) => ({
      name: place.name || "Sin nombre",
      address: place.vicinity || "Sin dirección",
      rating: place.rating || null,
      lat: place.geometry?.location?.lat || null,
      lng: place.geometry?.location?.lng || null,
    }));

    return res.json(psychologists);

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