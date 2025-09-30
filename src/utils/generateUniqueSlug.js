const slugify = require("slugify");

// Function for generating unique slug with Set (existing function)
function generateUniqueSlugWithSet(name, existingSet) {
  let base = slugify(name, { lower: true, strict: true });
  let slug = base;
  let i = 1;
  while (existingSet.has(slug)) {
    slug = `${base}-${i++}`;
  }
  existingSet.add(slug);
  return slug;
}

// Function for generating unique slug with Sequelize Model
async function generateUniqueSlug(name, Model, excludeId = null) {
  let base = slugify(name, { lower: true, strict: true });
  let slug = base;
  let i = 1;

  while (true) {
    const whereClause = { slug };

    // If excludeId is provided, exclude that record (for updates)
    if (excludeId) {
      whereClause.id = { [require("sequelize").Op.ne]: excludeId };
    }

    const existing = await Model.findOne({ where: whereClause });

    if (!existing) {
      return slug;
    }

    slug = `${base}-${i++}`;
  }
}

module.exports = generateUniqueSlug;
module.exports.generateUniqueSlugWithSet = generateUniqueSlugWithSet;
