import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { FunctionEvent } from '../functions/function.entity';
import { Person } from '../persons/person.entity';
import { GiftType } from '../shared/enums/gift-type.enum'; // ← shared import

@Entity('gifts_received')
export class GiftReceived {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => FunctionEvent, (f) => f.giftsReceived, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'function_id' })
    function: FunctionEvent;

    @ManyToOne(() => Person, (p) => p.giftsReceived)
    @JoinColumn({ name: 'person_id' })
    person: Person;
    @Column({
        name: "gift_type",
        type: 'enum',
        enum: GiftType,
        enumName: 'gift_type_enum',       // ← explicit DB enum name
    })
    giftType: GiftType;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    amount: number;

    @Column({ name: "voucher_details", nullable: true })
    voucherDetails: string;

    @Column({ nullable: true })
    itemDescription: string;

    @Column({ default: 1 })
    quantity: number;

    @Column({ nullable: true })
    notes: string;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    receivedDate: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
