const commentService = require("@/services/comment.service");
const throw404 = require("@/utils/throw404");

exports.getList = async (req, res) => {
  const result = await commentService.getAll();
  if (!result) throw404();
  res.success(200, result);
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const data = await commentService.getById(id);
  res.success(200, data);
};

exports.create = async (req, res) => {
  const comment = await commentService.create(req.body);
  res.success(201, comment);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const comment = await commentService.update(id, req.body);
  res.success(200, comment);
};

exports.likeOne = async (req, res) => {
  const { id } = req.params;
  const data = await commentService.likeComment(id);
  res.success(200, data);
};

exports.unlikeOne = async (req, res) => {
  const { id } = req.params;
  const data = await commentService.unlikeComment(id);
  res.success(200, data);
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  await commentService.delete(id);
  res.success(204);
};
