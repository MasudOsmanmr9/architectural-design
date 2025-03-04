const { Entity, PrimaryGeneratedColumn, Column } = require('typeorm');

@Entity()
class SecretToken {
  @PrimaryGeneratedColumn()
  id;

  @Column()
  token;

  @Column()
  user_id;
}

module.exports = SecretToken;