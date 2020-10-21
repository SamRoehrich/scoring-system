import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToOne,
  JoinColumn,
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

  @OneToOne((_type) => EventManager)
  @JoinColumn()
  managerID: EventManager;

  @Column()
  adminCode: string;

  @Column()
  scorekeeperCode: string;

  @Column()
  numBoulders: number;
}
