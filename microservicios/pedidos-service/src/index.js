const app = require('./app');
const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Pedidos service escuchando en el puerto ${PORT}`);
});
