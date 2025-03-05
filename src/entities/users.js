const { Entity, PrimaryGeneratedColumn, Column } = require('typeorm');

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id;

  @Column()
  email;

  @Column()
  password;

  @Column()
  name;

  @Column()
  role;
}

module.exports = User;