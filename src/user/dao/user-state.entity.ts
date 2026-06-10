import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { PendingAction } from "../constants";
import { TelegramUser } from "./user.entity";

@Entity("user_states")
export class UserState {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => TelegramUser, { onDelete: "CASCADE", eager: false })
  @JoinColumn({ name: "user_id" })
  user: TelegramUser;

  @Column({ name: "pending_action", type: "varchar", nullable: true })
  pendingAction: PendingAction | null;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
