import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Climber extends BaseEntity {
  @PrimaryGeneratedColumn()
  climberID: number;

  @Column()
  C_First_Name: string;

  @Column()
  C_Last_Name: string;

  @Column()
  ageCat: string;
}
