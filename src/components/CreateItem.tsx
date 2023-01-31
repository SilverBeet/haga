import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboard, faPen, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons'

import { api } from "../utils/api";
import Portal from "./Portal";
import { useForm } from 'react-hook-form';
import type { ItemType } from '../server/api/routers/item';
import { formatDate } from "../utils/time";
import { z } from "zod";
import { formatPrice } from "../utils/format";
import { useQueryClient } from "@tanstack/react-query";

type CreateItemProps = {
    onClose: () => void;
}

export const ItemSchema = z.object({
    idx: z.preprocess(Number, z.number()),
    shop: z.string().trim(),
    item_name: z.string().trim(),
    item_price: z.preprocess(Number, z.number()),
    item_discount: z.preprocess(Number, z.number()).default(0),
    volume: z.preprocess(Number, z.number()).default(0),
    weight: z.preprocess(Number, z.number()).default(0),
    bought_at: z.preprocess(arg => new Date(arg as string), z.date()),
})

const CreateItem: React.FC<CreateItemProps> = ({ onClose }) => {
    const queryClient = useQueryClient()
    const [selected, setSelected] = useState<z.infer<typeof ItemSchema>>()
    const [items, setItems] = useState<z.infer<typeof ItemSchema>[]>([])
    const [isEditing, setIsEditing] = useState(false)
    const { register, handleSubmit, resetField, reset, setValue } = useForm<z.infer<typeof ItemSchema>>();
    // const { mutate } = api.item.create.useMutation({
    //     onSuccess: () => {
    //         reset()
    //         setItems([])
    //         queryClient.invalidateQueries()
    //             .catch(console.log)
    //     }
    // })

    const onAdd = (data: ItemType) => {
        const parsed = ItemSchema.parse(data)
        setItems([...items, parsed])
    }

    const onSubmit = handleSubmit(data => {
        const parsed = ItemSchema.parse(data)
        resetField("idx")
        resetField("item_name")
        resetField("item_price")
        resetField("item_discount")
        resetField("weight")
        resetField("volume")
        if (isEditing) {
            setItems(prev => {
                prev[parsed.idx] = parsed
                return prev
            })
        } else setItems([...items, parsed])
        setIsEditing(false)
    });

    const onRemove = (idx: number) =>
        setItems(prev => prev.filter((_, i) => i !== idx))

    const onEdit = (idx: number) => {
        const item = items.find((_, i) => i === idx)
        if (item) {
            setSelected(item)
            setValue("idx", idx)
            setValue("item_name", item.item_name)
            setValue("item_price", item.item_price)
            setValue("item_discount", item.item_discount)
            setValue("weight", item.weight)
            setValue("volume", item.volume)
        }
        setIsEditing(true)
    }

    const total = items.reduce((t, i) => t + i.item_price, 0)

    return <Portal>
        <div
            className="fixed inset-0 m-auto w-screen
            bg-opacity-50 bg-black overflow-hidden"
        >
            <div className="grid fixed m-auto inset-0 h-fit w-fit my-16 bg-amber-50 rounded-2xl overflow-hidden">
                <FontAwesomeIcon
                    onClick={onClose}
                    icon={faXmark}
                    className="w-8 m-2 justify-self-end cursor-pointer
                    hover:bg-amber-500 active:bg-amber-200 bg-amber-300
                    rounded-full transition-colors text-white text-2xl"
                />
                <p className="justify-self-end px-4 mt-8 font-mono">{formatPrice(total)}</p>
                <div className="grid my-8 px-4 gap-4">
                    <form onSubmit={onSubmit} className="flex flex-col gap-4 col-start-1 col-end-1">
                        <input {...register("idx")} hidden value={items.length > 0 ? items.length + 1 : 0} />
                        <input
                            className="transition-colors cursor-pointer h-14 w-72
                        border text-center bg-white border-yellow-300 outline-none focus:border-black
                        hover:bg-amber-50 rounded-full px-5 font-mono"
                            {...register("shop")}
                            placeholder="Butikk"
                        />
                        <input
                            className="transition-colors cursor-pointer h-14 w-72
                        border text-center bg-white border-yellow-300 outline-none focus:border-black
                        hover:bg-amber-50 rounded-full px-5 font-mono"
                            {...register("item_name")}
                            placeholder="Produkt"
                        />
                        <input
                            className="transition-colors cursor-pointer h-14 w-72
                        border text-center bg-white border-yellow-300 outline-none focus:border-black
                        hover:bg-amber-50 rounded-full px-5 font-mono"
                            {...register("item_price")}
                            type="number"
                            step={0.01}
                            placeholder="Pris"
                        />
                        <input
                            className="transition-colors cursor-pointer h-14 w-72
                        border text-center bg-white border-yellow-300 outline-none focus:border-black
                        hover:bg-amber-50 rounded-full px-5 font-mono"
                            {...register("item_discount")}
                            type="number"
                            step={0.01}
                            placeholder="Avslag"
                        />
                        <input
                            className="transition-colors cursor-pointer h-14 w-72
                        border text-center bg-white border-yellow-300 outline-none focus:border-black
                        hover:bg-amber-50 rounded-full px-5 font-mono"
                            {...register("volume")}
                            type="number"
                            step={0.01}
                            placeholder="ml"
                        />
                        <input
                            className="transition-colors cursor-pointer h-14 w-72
                        border text-center bg-white border-yellow-300 outline-none focus:border-black
                        hover:bg-amber-50 rounded-full px-5 font-mono"
                            {...register("weight")}
                            type="number"
                            step={0.01}
                            placeholder="g"
                        />
                        <input
                            type="datetime-local"
                            className="transition-colors cursor-pointer h-14 w-72
                        border text-center bg-white border-yellow-300 outline-none focus:border-black
                        hover:bg-amber-50 rounded-full px-5 font-mono"
                            {...register("bought_at")}
                            placeholder="Kjøpt"
                        />
                        <input type="submit" value={isEditing ? "Oppdater" : "Legg til"}
                            className="transition-colors cursor-pointer h-14 border text-center w-72
                        bg-white border-yellow-300 hover:bg-amber-50 active:bg-yellow-300
                        rounded-full px-5 font-mono"
                        />
                    </form>
                    <div className="justify-self-center space-y-4 col-start-2 col-end-2">
                        {items.map((it, idx) => {
                            return <Item key={idx} selected={idx === selected?.idx} item={it} onCopy={() => onAdd(it)} onEdit={() => onEdit(idx)} onRemove={() => onRemove(idx)} />
                        })}
                        {/* {items.length > 0 && <input type="submit" value="Opprett" onClick={() => mutate(items)}
                            className="transition-colors cursor-pointer h-14 border text-center w-full
                        bg-white border-yellow-300 hover:bg-amber-50 active:bg-yellow-300
                        rounded-full px-5 font-mono"
                        />} */}
                    </div>
                </div>
            </div>
        </div>
    </Portal>
}

type ItemProps = {
    item: ItemType;
    onRemove: () => void;
    onEdit: () => void;
    onCopy: () => void;
    selected: boolean
}

const Item: React.FC<ItemProps> = ({ item, onRemove, onEdit, onCopy, selected }) => {
    return <div
        className={`flex min-w-max border hover:bg-amber-200
        active:bg-amber-200 ${selected ? "bg-amber-200" : "bg-amber-100"} rounded-full cursor-pointer
        p-4 justify-between gap-4`}>
        <p className="text-sm font-mono">{item.item_name}</p>
        <p className="text-sm font-mono">{formatPrice(item.item_price)}</p>
        {item.item_discount > 0 && <p className="text-sm font-mono">{formatPrice(item.item_discount)}</p>}
        {item.volume > 0 && <p className="text-sm font-mono">{item.volume} ml</p>}
        {item.weight > 0 && <p className="text-sm font-mono">{item.weight} g</p>}
        <p className="text-sm font-mono pl-4">{formatDate(item.bought_at)}</p>
        <FontAwesomeIcon icon={faPen} onClick={onEdit} />
        <FontAwesomeIcon icon={faClipboard} onClick={onCopy} />
        <FontAwesomeIcon icon={faTrash} onClick={onRemove} />
    </div>
}

export default CreateItem;