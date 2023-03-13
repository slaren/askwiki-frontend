import { Component, ViewChild } from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
import { Observable, BehaviorSubject, Subscription, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { AskWikiApiService } from './askwikiapi.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ask-wiki';

  articles$ = new Observable<string[]>();
  question = new BehaviorSubject<string>('');

  otherArticles$ = new Observable<string[]>();
  otherArticle = new BehaviorSubject<string>('');

  answer$ = new Observable<string>();
  private unsubscribeAnswer$: Subject<void> = new Subject<void>();

  constructor(private askWikiApiService: AskWikiApiService) {}

  ngOnInit(): void {
    this.articles$ = this.question.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((question: string) => this.searchArticles(question))
    );

    this.otherArticles$ = this.otherArticle.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((article: string) => this.searchOtherArticles(article))
    );
  }

  questionChanged(question: string) {
    this.question.next(question);
  }

  searchArticles(question: string): Observable<string[]> {
    return this.askWikiApiService.suggestArticles(question);
  }

  otherArticleChanged(article: string) {
    this.otherArticle.next(article);
    // deselect the article suggestion list
    this.articleSuggestionList.selectedOptions.clear();
  }

  searchOtherArticles(article: string): Observable<string[]> {
    return this.askWikiApiService.searchArticles(article);
  }

  @ViewChild('articleSuggestionList') articleSuggestionList!: MatSelectionList;

  getSelectedArticle() {
    var article;
    if (
      this.articleSuggestionList &&
      this.articleSuggestionList.selectedOptions.selected.length > 0
    ) {
      article = this.articleSuggestionList.selectedOptions.selected[0].value;
    } else {
      article = this.otherArticle.getValue();
    }
    return article;
  }

  answerStarted: boolean = false;
  answerInProgress: boolean = false;
  answerComplete: boolean = false;

  getAnswer() {
    this.answerStarted = true;
    this.answerInProgress = false;
    this.answerComplete = false;
    this.unsubscribeAnswer$.next();

    let article = this.getSelectedArticle();
    let question = this.question.getValue();

    //this.askWikiApiService.getAnswer(question, article).subscribe((answer: string) => {
    //  this.answer = answer;
    //});

    this.answer$ = this.askWikiApiService
      .getAnswerStream(question, article)
      .pipe(
        takeUntil(this.unsubscribeAnswer$),
        tap({
          next: () => (this.answerInProgress = true),
          complete: () => {
            this.answerInProgress = false;
            this.answerComplete = true;
          },
        })
      );

    //this.answer$.subscribe((fragment: string) => {
    //  this.answerValue += fragment;
    //  console.log('answer', this.answerValue);
    //});
  }

  hasArticle(): boolean {
    return this.getSelectedArticle() != '';
  }

  ngOnDestroy(): void {
    this.unsubscribeAnswer$.next();
    this.unsubscribeAnswer$.complete();
  }
}
