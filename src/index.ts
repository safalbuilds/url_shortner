import app from "./app.js";
import PORT from "./config/env.js";

app.listen(PORT, () => {
  try {
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.log("Couldn't start server due to ", err);
  }
});
