'use strict';
module.exports = (sequelize, DataTypes) => {
  const Posts = sequelize.define('Posts', {
    title: DataTypes.STRING,
    body: DataTypes.STRING,
    category: DataTypes.STRING
  }, {});
  Posts.associate = function(models) {
    Posts.hasMany(models.Comments,{
      as: 'comments',
      foreignKey: 'postid'
    })
  };
  return Posts;
};