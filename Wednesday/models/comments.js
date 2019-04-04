'use strict';
module.exports = (sequelize, DataTypes) => {
  const Comments = sequelize.define('Comments', {
    postid: DataTypes.INTEGER,
    comment: DataTypes.STRING,
    username: DataTypes.STRING
  }, {});
  Comments.associate = function(models) {
    Comments.belongsTo(models.Posts,{
      as: 'posts',
      foreignKey: 'id'
    })
  };
  return Comments;
};