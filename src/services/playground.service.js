const pt = require("periodic-table");
const { Entity, EntityCombination, UserPlaygroundEntity, User } = require("@/models");
const chemistryService = require("@/openai/services/chemistryService");
const redis = require("@/configs/redis");

class PlaygroundService {
  async getElements() {
    const cacheKey = "playground:elements:all";
    
    // Try to get from Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("✅ Elements fetched from Redis cache");
      return JSON.parse(cached);
    }
    
    // If not in cache, get from periodic-table and cache it
    console.log("📦 Elements fetched from periodic-table library");
    const allElements = pt.all().map((element) => ({
      symbol: element.symbol,
      name: element.name,
    }));
    
    // Cache for 1 hour (elements don't change)
    await redis.set(cacheKey, JSON.stringify(allElements), 3600*24*7);
    
    return allElements;
  }


  async getUserEntities(userId) {
    const cacheKey = `playground:user:${userId}:entities`;
    
    // Try to get from Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`✅ User ${userId} entities fetched from Redis cache`);
      return JSON.parse(cached);
    }
    
    // If not in cache, query DB
    console.log(`📦 User ${userId} entities fetched from DB`);
    const userEntities = await UserPlaygroundEntity.findAll({
      where: { userId },
      include: [
        {
          model: Entity,
          as: "entity",
          attributes: ["id", "name", "icon", "formula", "description"],
        },
      ],
      order: [["discoveredAt", "DESC"]],
    });

    const result = userEntities.map((upe) => ({
      id: upe.entity.id,
      name: upe.entity.name,
      icon: upe.entity.icon,
      formula: upe.entity.formula,
      description: upe.entity.description,
      discoveredAt: upe.discoveredAt,
    }));
    
    // Cache for 5 minutes (user discoveries change frequently)
    await redis.set(cacheKey, JSON.stringify(result), 300);
    
    return result;
  }

  /**
   * Combine two elements to create an entity
   * @param {string} element1 - First element symbol or entity name
   * @param {string} element2 - Second element symbol or entity name
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Created or existing entity
   */
  async combineElements(element1, element2, userId) {
    // Ensure consistent ordering (alphabetically) to avoid duplicate combinations
    const [sortedElement1, sortedElement2] =
      element1 < element2 ? [element1, element2] : [element2, element1];

    // Check if this combination already exists in the database
    const existingCombination = await EntityCombination.findOne({
      where: {
        element1: sortedElement1,
        element2: sortedElement2,
      },
      include: [
        {
          model: Entity,
          as: "resultEntity",
        },
      ],
    });

    let entity;

    if (existingCombination) {
      // Combination exists, use the cached result
      entity = existingCombination.resultEntity;
    } else {
      // New combination - Call OpenAI API
      console.log(`🔬 New combination: ${element1} + ${element2}`);
      
      // Call OpenAI to get the result
      const openAIResult = await chemistryService.combineElements(
        element1,
        element2
      );
      if (openAIResult) {
        try {
          if (userId) {
            console.log(`Adding 1 point to user ${userId} for playground combination`);
            
            await User.increment("point", { by: 1, where: { id: userId } });
            console.log(`➕ Added 1 point to user ${userId} for playground combination`);
          }
        } catch (err) {
          console.error("Error incrementing user point for playground combination:", err);
          // don't block response on point increment failure
        }
      }
      console.log("✨ OpenAI result:", openAIResult);

      // Create the new entity
      entity = await Entity.create({
        name: openAIResult.name,
        icon: openAIResult.icon,
        formula: openAIResult.formula,
        description: openAIResult.description,
      });

      // Save the combination for future use
      await EntityCombination.create({
        element1: sortedElement1,
        element2: sortedElement2,
        resultEntityId: entity.id,
      });

      console.log(`✅ Created new entity: ${entity.name} (${entity.formula})`);
    }

    // Add the entity to user's playground if not already present
    const [userPlaygroundEntity, created] = await UserPlaygroundEntity.findOrCreate({
      where: {
        userId,
        entityId: entity.id,
      },
      defaults: {
        discoveredAt: new Date(),
      },
    });

    // Invalidate user's entities cache after successful combine
    const userCacheKey = `playground:user:${userId}:entities`;
    await redis.del(userCacheKey);
    console.log(`🗑️  Invalidated cache for user ${userId} entities`);

    return {
      entity: {
        id: entity.id,
        name: entity.name,
        icon: entity.icon,
        formula: entity.formula,
        description: entity.description,
      },
      isNew: !existingCombination ? true : false, // Indicates if this is newly discovered by the user
    };
  }

  /**
   * Remove entity from user's playground
   * @param {number} userId - User ID
   * @param {number} entityId - Entity ID
   */
  async removeUserEntity(userId, entityId) {
    const deleted = await UserPlaygroundEntity.destroy({
      where: {
        userId,
        entityId,
      },
    });

    if (!deleted) {
      throw new Error("Entity not found in your playground");
    }

    // Invalidate user's entities cache after removal
    const userCacheKey = `playground:user:${userId}:entities`;
    await redis.del(userCacheKey);
    console.log(`🗑️  Invalidated cache for user ${userId} entities after removal`);

    return { success: true };
  }
}

module.exports = new PlaygroundService();
