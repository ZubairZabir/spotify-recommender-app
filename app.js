const express = require("express");
const passport = require("passport");
const SpotifyStrategy = require("passport-spotify").Strategy;
const session = require("express-session");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8888;

app.use(
  cors({
    origin: "https://spotify-recommender-app.netlify.app", // Update this with your actual Netlify URL
    credentials: true,
  })
);

app.use(
  session({
    secret: "f6e4b4d9d6d7dcdafed2b1b3c5c6c9c9a0e3b6e4d8e1b0f1d3e2d5e9f7b9d8a3e2e6c5d2d9d4d0d2c2c9c1c2d1c8c3d3b5b2b0f3d9c5c8b1a3b8", // Replace with your generated secure key
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: process.env.SPOTIFY_REDIRECT_URI,
    },
    function (accessToken, refreshToken, expires_in, profile, done) {
      return done(null, { profile, accessToken });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.get(
  "/auth/spotify",
  passport.authenticate("spotify", {
    scope: ["user-read-private", "user-read-email", "user-top-read"],
  })
);

app.get(
  "/callback",
  passport.authenticate("spotify", { failureRedirect: "/" }),
  function (req, res) {
    res.redirect("https://spotify-recommender-app.netlify.app");
  }
);

app.get("/recommendations", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  const accessToken = req.user.accessToken;
  try {
    const topTracksResponse = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          time_range: "short_term", // Use 'short_term' for recent music taste
          limit: 5, // Get top 5 tracks to use as seed tracks
        },
      }
    );

    const topTracks = topTracksResponse.data.items;

    const seedTracks = topTracks.map((track) => track.id).join(",");

    const recommendationsResponse = await axios.get(
      "https://api.spotify.com/v1/recommendations",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          seed_tracks: seedTracks,
          limit: 10, // Limit to 10 recommended tracks
        },
      }
    );

    const recommendations = recommendationsResponse.data.tracks.map(
      (track) => ({
        name: track.name,
        artist: track.artists[0].name,
        url: track.external_urls.spotify,
      })
    );

    res.json({ recommendations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
