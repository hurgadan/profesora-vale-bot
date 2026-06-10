import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { TelegramUser } from "../../user/dao/user.entity";
import { BotAction } from "../constants";

@Entity("bot_events")
export class BotEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TelegramUser, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: TelegramUser;

  @Column({ type: "varchar" })
  action: BotAction;

  @Column({ type: "text", nullable: true })
  payload: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
