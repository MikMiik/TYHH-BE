const slugify = require("slugify");

function generateUniqueSlug(name, existingSet) {
  let base = slugify(name, { lower: true, strict: true });
  let slug = base;
  let i = 1;
  while (existingSet.has(slug)) {
    slug = `${base}-${i++}`;
  }
  existingSet.add(slug);
  return slug;
}

module.exports = generateUniqueSlug;
