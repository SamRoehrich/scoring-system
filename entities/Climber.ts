import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Event } from "./Event";

@Entity()
export class Climber extends BaseEntity {
  @PrimaryGeneratedColumn()
  climberID: number;

  @Column()
  climberFirstName: string;

  @Column()
  climberLastName: string;

  @Column()
  ageCat: string;

  @Column()
  gender: string;

  @ManyToOne(
    (_type) => Event,
    (event) => event.eventID
  )
  event: Event;
}
