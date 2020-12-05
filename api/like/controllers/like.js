"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

module.exports = {
  async create(ctx) {
    let entity;

    const { user } = ctx.state;
    const { post } = ctx.request.body;
    if (typeof post !== "number") {
      ctx.throw(400, "Only pass the id of post");
    }

    const realPost = await strapi.services.post.findOne({ id: post });
    if (!realPost) {
      ctx.throw(400, "This post doesn't exist");
    }

    const found = await strapi.services.like.findOne({
      user: user.id,
      post: post,
    });

    if (found) {
      ctx.throw(400, "You already liked this post");
    }

    if (ctx.is("multipart")) {
      ctx.throw(400, "Only make json request not multipart");
      /*
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.restaurant.create(data, { files });
      */
    } else {
      entity = await strapi.services.like.create({ post, user });
    }

    //Update likes counter for post
    const { likes } = realPost;

    const updatedPost = await strapi.services.post.update(
      { id: post },
      { likes: likes + 1 }
    );

    return sanitizeEntity(entity, { model: strapi.models.like });
  },
  async delete(ctx) {
    const { user } = ctx.state;
    const { postId } = ctx.params;

    const post = parseInt(postId);
    if (typeof post !== "number") {
      ctx.throw(400, "Only pass the id of post");
    }

    const entity = await strapi.services.like.delete({
      post: post,
      user: user.id,
    });

    if (entity.length) {
      const { likes } = entity[0].post;
      const updatedPost = await strapi.services.post.update(
        { id: post },
        { likes: likes - 1 }
      );

      return sanitizeEntity(entity, { model: strapi.models.like });
    }
  },
};
