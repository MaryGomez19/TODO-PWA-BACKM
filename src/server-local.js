import "dotenv/config";
import app from "./app.js";

const {PORT = 5555} = process.env;

app.listen(PORT, () => console.log(`Servidor ejecutandose en http://localhost:${PORT}`));