import app from "./app.js";
import PORT from "./config/env.js";

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// import { getAll } from "./repositories/url.respository.js";
// getAll()