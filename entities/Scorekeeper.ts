import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Scorekeeper extends BaseEntity {
  @PrimaryGeneratedColumn()
  scorekeeperID: number;

  @Column()
  SK_First_Name: string;

  @Column()
  SK_Last_Name: string;
}
