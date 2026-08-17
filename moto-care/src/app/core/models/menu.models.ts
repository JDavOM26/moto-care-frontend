export interface MenuOption {
    id: number;
    name: string;
    path: string;
    icon?: string;
}

export interface MenuGroup {
    id: number;
    name: string;
    icon?: string;
    options: MenuOption[];
}

export interface MenuModule {
    id: number;
    name: string;
    icon?: string;
    menus: MenuGroup[];
}


export type Menu = MenuModule;