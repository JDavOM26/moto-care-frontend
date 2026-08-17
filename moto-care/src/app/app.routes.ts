import { Routes } from '@angular/router';
import { LoginPage } from './component/login.page/login.page';
import { MainLayout } from './layout/main-layout';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginPage },

    {
        path: '',
        component: MainLayout,
        children: [
            {
                path: 'dashboard',
                redirectTo: 'dashboards',
                pathMatch: 'full'
            },
            {
                path: 'dashboards',
                loadComponent: () => import('./component/dashboards/dashboards').then(m => m.DashboardsComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./component/profile/profile/profile').then(m => m.Profile)
            },
            {
                path: 'catalogos/motos',
                loadComponent: () => import('./component/catalog/motos/motos-mgmt/motos-mgmt').then(m => m.MotosMgmtComponent)
            },
            {
                path: 'catalogos/motos/add',
                loadComponent: () => import('./component/catalog/motos/add-moto/add-moto').then(m => m.AddMotoComponent)
            },
            {
                path: 'catalogos/motos/:id/edit',
                loadComponent: () => import('./component/catalog/motos/add-moto/add-moto').then(m => m.AddMotoComponent)
            },
            {
                path: 'ventas/inventario/stock',
                loadComponent: () => import('./component/inventory/page/inventory').then(m => m.InventoryComponent)
            },
            {
                path: 'ventas/inventario/stock/:id/kardex',
                loadComponent: () => import('./component/inventory/page/kardex/kardex').then(m => m.KardexComponent)
            },
            {
                path: 'ventas/inventario/providers',
                loadComponent: () => import('./component/inventory/providers/providers-mgmt/providers-mgmt').then(m => m.ProvidersMgmt)
            },
            {
                path: 'ventas/inventario/providers/add',
                loadComponent: () => import('./component/inventory/providers/add-provider/add-provider').then(m => m.AddProviderComponent)
            },
            {
                path: 'ventas/inventario/providers/:id/edit',
                loadComponent: () => import('./component/inventory/providers/add-provider/add-provider').then(m => m.AddProviderComponent)
            },
            {
                path: 'clients',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./component/client/client').then(m => m.ClientComponent)
                    },
                    {
                        path: ':id/detail',
                        loadComponent: () => import('./component/client/client-detail/client-detail').then(m => m.ClientDetailComponent)
                    }
                ]
            },
            {
                path: 'work-orders',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./component/work-orders/work-orders').then(m => m.WorkOrdersComponent)
                    },
                    {
                        path: ':id/detail',
                        loadComponent: () => import('./component/work-orders/components/order-detail/order-detail').then(m => m.OrderDetail)
                    }
                ]
            },
            {
                path: 'vehicle-reception',
                loadComponent: () => import('./component/vehicle-reception/vehicle-reception').then(m => m.VehicleReceptionComponent)
            },
            {
                path: 'security',
                children: [
                    {
                        path: 'users',
                        loadComponent: () => import('./component/security/users/users-mgmt/users-mgmt').then(m => m.UsersMgmt)
                    },
                    {
                        path: 'users/add',
                        loadComponent: () => import('./component/security/users/add-user/add-user').then(m => m.AddUserComponent)
                    }
                ]
            },
            {
                path: 'facturacion/historial',
                loadComponent: () => import('./component/billing/invoices-history/invoices-history').then(m => m.InvoicesHistoryComponent)
            }
        ]
    },

    { path: '**', redirectTo: '/login' }
];
