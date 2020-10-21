import { BaseEntity, PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity()
export class EventManager extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  M_FirstName: string;

  @Column()
  M_LastName: string;

  @Column()
  email: string;

  @Column()
  password: string;
}
