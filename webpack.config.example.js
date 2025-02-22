// Example webpack configuration for consuming projects
module.exports = {
  mode: "development",
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    // Ensure proper module resolution
    mainFields: ["module", "main"],
    // Add aliases for peer dependencies if needed
    alias: {
      "react": require.resolve("react"),
      "react-dom": require.resolve("react-dom")
    }
  }
};