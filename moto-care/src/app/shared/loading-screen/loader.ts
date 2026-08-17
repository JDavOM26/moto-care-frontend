import { Component, inject } from "@angular/core";
import { LoaderService } from "../../core/services/common/loader.service";

@Component({
    selector: 'app-loader',
    templateUrl: './loader.html',
    styleUrl: './loader.css'
})
export class LoaderComponent { 
    public loaderService = inject(LoaderService);
}