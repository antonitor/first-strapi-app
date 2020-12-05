"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

module.exports = {
  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      if (!data) {
        ctx.throw(400, "Please add some content");
      }
      if (!files) {
        ctx.throw(400, "Please add at least a file");
      }
      //User logged in which creates this post to be added as author
      const { user } = ctx.state;

      entity = await strapi.services.post.create(
        { ...data, ...{ likes: 0, author: user } },
        { files }
      );
    } else {
      ctx.throw(400, "You must submit a multipart request");
    }
    return sanitizeEntity(entity, { model: strapi.models.post });
  },
  async update(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;
    let entity;
    if (ctx.is("multipart")) {
      ctx.throw(400, "Update must be aplication/json not multipart");
      /* NO PICTURE UPDATE ALLOWED
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.post.update({ id }, data, {
        files,
      });*/
    } else {
      //We dont want likes to be added so nobody can abuse
      delete ctx.request.body.likes;
      // "" author: user.id "" only allows the post author to update it
      entity = await strapi.services.post.update(
        { id, author: user.id },
        ctx.request.body
      );
    }

    return sanitizeEntity(entity, { model: strapi.models.post });
  },
  async delete(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;

    const entity = await strapi.services.post.delete({ id, author: user.id });
    return sanitizeEntity(entity, { model: strapi.models.post });
  },
};
