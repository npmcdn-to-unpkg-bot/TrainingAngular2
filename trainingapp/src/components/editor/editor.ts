import {
	Component, 
	Input,
	Inject, 
    ViewChildren,
	ContentChildren, 
	AfterViewInit, 
	QueryList, 
	ElementRef,
    ChangeDetectorRef
}
from '@angular/core';

import {NgIf} from '@angular/common';

import {EditorTab} from '../editorTab/editorTab';
import {GPRETTIFYER, JQUERY} from '../../services/constants';


interface PlunkerData{
    name:string;
    value:string; 
}


@Component({
	selector:'editor', inputs:['localexec'],
	templateUrl:'src/components/editor/editor.html',
	directives:[Editor, EditorTab, NgIf],
	styleUrls: ['src/components/editor/editor.css']
})
export class Editor implements AfterViewInit {

	@Input() fiddle: boolean = false;
	@Input() plunker: boolean = false;
    @Input() ng2: boolean= false;
	@Input() localExec: boolean = false;
	@Input() title: string = 'sample';
	@Input() description: string = 'sample';
	@Input() framework: string = 'library';
	@Input() version: string = 'pure';
	@Input() wrap: string = 'domReady';

	public fiddleUrl = 'http://jsfiddle.net/api/post/' + this.framework + '/' + this.version + '/';
	public plunkerUrl = 'http://plnkr.co/edit/';
    
    private nbRegisteredTabs: number = 0;
    private plunkerData: Array<PlunkerData>= [];
    
    private elt: HTMLElement;
    private cdr: ChangeDetectorRef;
	private formElement: any;
    
    private isViewInit= false;

        
    @ViewChildren(EditorTab) viewTabs: QueryList<EditorTab>; 
	@ContentChildren(EditorTab) contentTabs: QueryList<EditorTab>;
    private tabs: Array<EditorTab>= [];
  
  
	constructor( 
		@Inject(GPRETTIFYER) private prettyPrint: any,
		@Inject(JQUERY) private jquery: any, 
		eltRef: ElementRef,
        cdr: ChangeDetectorRef
	) {
		this.elt = eltRef.nativeElement;
        this.cdr= cdr;
	}
    
    
    getTabs(){
        
        if (this.isViewInit){
            return this.tabs;
        }
        
        this.tabs.splice(0);

        (this.viewTabs === undefined? [] : this.viewTabs.toArray())
		.concat(this.contentTabs.toArray())
        .forEach( ( value: EditorTab, index: number ) =>{
            
            if (!this.ng2 && index === 0){
                value.visible= true;
            }
			else if (this.ng2 && index === 2) {
                value.visible = true;
            }
            else{
                value.visible= false;
            }
            
            this.tabs.push(value);
        } );
 

        return this.tabs;
    }

	displayTab = (index: number) => {
        
        this.getTabs()
		.forEach((currentEditor: EditorTab, currentIndex: number) => {
			currentEditor.visible = false;
			if (currentIndex === index){
				currentEditor.visible = true;
			}
		});
	};

	ngAfterViewInit(): void {
		this.prettyPrint();
		this.formElement= this.jquery(this.elt).find('form');
        this.cdr.detectChanges();
        this.isViewInit= true;
        this.getTabs().forEach((tab:EditorTab, index: number)=>{
			tab.cdr.detectChanges();
        });
	};

	registerTab= ():number => {
		return this.nbRegisteredTabs++;
	}

	getCode= (filteType: string):string => {
		let res= "";
        this.getTabs()        
		.forEach( (tab:EditorTab, index: number): void => {
			if (tab.fileType === filteType){
				res += tab.getCode();
			}
		} );

		return res;
	}
    
    getPlunkerData= ():Array<PlunkerData> => {
        //Clear array
        this.plunkerData.splice(0);        
        
        this.plunkerData.push({name:'description', value: this.description});
        
        this.getTabs()
		.forEach( (tab:EditorTab, index: number): void => {
            this.plunkerData.push({name:'files[' + tab.title + ']', value: tab.getCode()});
		} );

		return this.plunkerData;
    };
    
    
	submit= (e:Event): void =>{
		e.preventDefault();
		this.formElement[0].submit();
	}

	execJs= (): void => {
		this.getTabs().forEach((tab: EditorTab, index: number): void => {
            
			if (tab.fileType === 'js') {
				console.log('Eval ' + tab.title);
				eval(tab.getCode());
			}
		});
	}

}