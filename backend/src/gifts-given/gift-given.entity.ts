import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Person } from '../persons/person.entity';
import { GiftType } from '../shared/enums/gift-type.enum'; // ← shared import (no cross-entity dep)

@Entity('gifts_given')
export class GiftGiven {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Person, (p) => p.giftsGiven, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'person_id' })
    person: Person;

    @Column()
    functionName: string;

    @Column({
        type: 'enum',
        enum: GiftType,
        enumName: 'gift_type_enum',       // ← same DB enum name as gifts_received
    })
    giftType: GiftType;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    amount: number;

    @Column({ nullable: true })
    voucherDetails: string;

    @Column({ nullable: true })
    itemDescription: string;

    @Column({ default: 1 })
    quantity: number;

    @Column({ nullable: true })
    notes: string;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    givenDate: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
