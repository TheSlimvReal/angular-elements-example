import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'custom-element',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.Native
})
export class AppComponent {
  @Input() name = 'Simon';

  @Input() onclick= () => console.log('I got clicked!');

  @Output('element-click') buttonClick = new EventEmitter<string>()

  onButtonClick() {
    if (typeof this.onclick == 'string') {
      this.onclick = eval(this.onclick);
    }
    this.onclick()
  }

  onSecondButtonClick() {
    this.buttonClick.emit('The second button got clicked!');
  }
 }
