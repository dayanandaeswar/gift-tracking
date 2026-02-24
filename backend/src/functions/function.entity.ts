import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { GiftReceived } from '../gifts-received/gift-received.entity';

@Entity('functions')
export class FunctionEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ name: "event_date", type: 'date', nullable: true })
    eventDate: string;

    @OneToMany(() => GiftReceived, (gr) => gr.function, { cascade: true })
    giftsReceived: GiftReceived[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
