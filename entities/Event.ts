import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
} from "typeorm";
import { EventManager } from "./EventManager";

@Entity()
export class Event extends BaseEntity {
  @PrimaryGeneratedColumn()
  eventID: number;

  @Column()
  eventName: string;

  @Column()
  eventLocation: string;

  @Column()
  eventDate: string;

  @ManyToOne((_type) => EventManager)
  managerID: EventManager;

  @Column()
  adminCode: string;

  @Column()
  scorekeeperCode: string;

  @Column()
  numBoulders: number;
}
