import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ReviewtDB extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filial: string;

  @Column({ type: "int" })
  mark: number;

  @Column()
  content: string;

  @Column()
  publickName: string;

  @Column()
  userName: string;

  @Column({ type: "timestamptz" })
  created_at: Date;

  @Column()
  media: string;
}
