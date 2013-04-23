//
//  ParamStringsViewController.m
//  RideMix
//
//  Created by Alejandro Rodriguez on 4/16/13.
//  Copyright (c) 2013 Alejandro Rodriguez. All rights reserved.
//

#import "ParamStringsViewController.h"

@interface ParamStringsViewController ()

@property (strong, nonatomic) IBOutlet UITextView *textView;

@end

@implementation ParamStringsViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
	NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *params = [defaults objectForKey:@"params"];
    self.textView.text = params;
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)clearText:(UIBarButtonItem *)sender {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setObject:nil forKey:@"params"];
    self.textView.text = @"";
}

@end
