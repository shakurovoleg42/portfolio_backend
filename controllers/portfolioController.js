const { Portfolio } = require("../mongo");

const getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({});
    res.json(portfolios);
  } catch (err) {
    console.error("Error fetching portfolios:", err);
    res.status(500).send("Server Error");
  }
};

const getPortfolioBySlug = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ slug: req.params.slug });
    if (!portfolio) {
      return res.status(404).send("Product not found");
    }
    res.json(portfolio);
  } catch (err) {
    console.error("Error fetching portfolio:", err);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  getAllPortfolios,
  getPortfolioBySlug,
};
