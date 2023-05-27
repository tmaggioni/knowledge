import { InputHTMLAttributes, useState } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    options: { label: string, value: string | number }[];
    onChangeValue: (selectds: string[]) => void;

}

export const Select = ({ options, onChange, ...props }: Props) => {
    const [filter, setFilter] = useState("");
    const [opened, setOpened] = useState(false);
    const filteredItems = filter.length > 0 ? options.filter(item => item.label.toLowerCase().includes(filter.toLocaleLowerCase())) : options;



    return (
        <div className="flex flex-col mt-2 p-2 rounded-md bg-slate-500" onClick={() => setOpened(!opened)}>
            <input type="text" {...props} className="pl-2" onChange={(e) => setFilter(e.target.value)} value={filter} />
            {opened && <ul>
                {filteredItems.map(item => (<li onClick={() => alert(item.value)} key={item.value}>{item.label}</li>))}
            </ul>}


        </div>

    )


}