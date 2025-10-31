const openai = require("../openai");
const chemistryAgent = require("../agents/chemistryAgent");

class ChemistryService {
  /**
   * Combine two chemical elements/compounds using OpenAI
   * @param {string} element1 - First element (e.g., "H", "Na", "H2O")
   * @param {string} element2 - Second element (e.g., "O", "Cl", "CO2")
   * @returns {Promise<Object>} - Result with name, icon, formula, description
   */
  async combineElements(element1, element2) {
    try {
      // Prepare the prompt
      const userPrompt = `Kết hợp: element1="${element1}", element2="${element2}"`;

      // Prepare messages for OpenAI
      const messages = [
        { role: "system", content: chemistryAgent.systemPrompt },
        { role: "user", content: userPrompt },
      ];

      console.log("🧪 Calling OpenAI to combine:", element1, "+", element2);

      // Call OpenAI
      const response = await openai.send({
        input: messages,
        temperature: chemistryAgent.settings.temperature,
        max_output_tokens: chemistryAgent.settings.max_output_tokens,
        model: chemistryAgent.settings.model,
      });

      console.log("🤖 OpenAI response:", response);

      // Parse JSON response
      let result;
      try {
        // Try to extract JSON from response (in case there's extra text)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          result = JSON.parse(response);
        }
      } catch (parseError) {
        console.error("❌ Failed to parse OpenAI response:", response);
        throw new Error("Invalid JSON response from OpenAI");
      }

      // Validate response structure
      if (!result.name || !result.formula) {
        console.error("❌ Invalid response structure:", result);
        throw new Error("Missing required fields in OpenAI response");
      }

      // Ensure icon exists (default if not provided)
      if (!result.icon) {
        result.icon = "🧪";
      }

      // Ensure description exists (default if not provided)
      if (!result.description) {
        result.description = `Sản phẩm từ ${element1} và ${element2}`;
      }

      console.log("✅ Parsed result:", result);

      return {
        name: result.name,
        icon: result.icon,
        formula: result.formula,
        description: result.description,
      };
    } catch (error) {
      console.error("❌ Error in chemistryService.combineElements:", error);
      
      // Return fallback result if OpenAI fails
      return {
        name: `${element1} + ${element2}`,
        icon: "🧪",
        formula: `${element1}${element2}`,
        description: `Hợp chất được tạo từ ${element1} và ${element2}`,
      };
    }
  }
}

module.exports = new ChemistryService();

