/**
 * Kullanıcı modeli
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Kullanici = sequelize.define('Kullanici', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [['admin', 'user']],
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    tableName: 'kullanicilar',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      // Şifreyi kaydetmeden önce hashle
      beforeCreate: async (kullanici) => {
        if (kullanici.password) {
          const salt = await bcrypt.genSalt(10);
          kullanici.password = await bcrypt.hash(kullanici.password, salt);
        }
      },
      // Şifre değiştiyse güncellemeden önce hashle
      beforeUpdate: async (kullanici) => {
        if (kullanici.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          kullanici.password = await bcrypt.hash(kullanici.password, salt);
        }
      },
    },
  });

  // Şifre doğrulama metodu
  Kullanici.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return Kullanici;
};
